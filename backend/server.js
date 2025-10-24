// backend/server.js
// Express-based OmniDeFi backend for ZK proof sharing

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

// In-memory store (for demo only; a DB should be used in production)
const shares = new Map();

// Health check route
app.get("/", (_, res) => res.send("Backend is running and ready to accept requests."));

// POST /api/share
// Request: { addresses: string[], chain: "ethereum", amountPct: number, txPct: number }
app.post("/api/share", async (req, res) => {
  try {
    const { addresses, chain, amountPct, txPct } = req.body;

    if (!addresses?.length || !chain) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    // Paths setup
    const fetchScript = path.join(__dirname, "scripts", "fetch-balances.js");
    const buildScript = path.join(__dirname, "scripts", "build-proof.js");
    const circuitPath = path.resolve(__dirname, "circuits", "reveal_percent.circom");

    const id = uuidv4();
    const tmpDir = path.join(__dirname, ".tmp", id);
    await fs.mkdir(tmpDir, { recursive: true });

    // Snapshot file path (written by fetch-balances)
    const snapshotPath = path.join(tmpDir, "snapshot.json");

    // Step 1: Run fetch-balances.js
    console.log(`⛓ Running fetch-balances for ${addresses.length} address(es)...`);
    const fetchProc = spawn("node", [fetchScript, snapshotPath, chain, ...addresses], {
      stdio: "inherit",
      env: process.env,
    });

    await new Promise((resolve, reject) => {
      fetchProc.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error("fetch-balances failed"))
      );
    });
    console.log("✅ fetch-balances completed.");

    // Step 2: Generate proof via build-proof.js
    const publicPath = path.join(tmpDir, "public.json");
    const proofPath = path.join(tmpDir, "proof.json");
    const calldataPath = path.join(tmpDir, "calldata.txt");

    console.log("🔧 Starting build-proof script...");
    const buildArgs = [
      buildScript,
      circuitPath, // absolute path to correct circuit file
      snapshotPath,
      String(amountPct),
      String(txPct),
      publicPath,
      proofPath,
      calldataPath,
    ];

    const buildProc = spawn("node", buildArgs, {
      stdio: "inherit",
      env: process.env,
    });

    await new Promise((resolve, reject) => {
      buildProc.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error("build-proof failed"))
      );
    });
    console.log("✅ build-proof completed successfully.");

    // Step 3: Read generated files
    const publicJson = JSON.parse(await fs.readFile(publicPath, "utf8"));
    const proofJson = JSON.parse(await fs.readFile(proofPath, "utf8"));
    const calldata = await fs.readFile(calldataPath, "utf8");

    // Step 4: Store in memory
    shares.set(id, { chain, amountPct, txPct, publicJson, proofJson, calldata });

    res.json({ id, amountPct, txPct });
  } catch (e) {
    console.error("❌ Error in /api/share:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/view/:id — view proof payload
app.get("/api/view/:id", (req, res) => {
  const { id } = req.params;
  const share = shares.get(id);
  if (!share) return res.status(404).json({ error: "Share not found" });
  res.json(share);
});

// Start the API server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 API server listening on http://localhost:${port}`));
