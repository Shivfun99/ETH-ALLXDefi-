// backend/scripts/build-proof.js
// Usage:
// node build-proof.js <circuitPath> <snapshotPath> <amountPct> <txPct> <public.json> <proof.json> <calldata.txt>

import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

const [, , circuitPath, snapshotPath, amountPctStr, txPctStr, outPublic, outProof, outCalldata] = process.argv;

// Helper to execute commands
async function exec(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", cwd });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed`))));
  });
}

async function main() {
  try {
    const circuitDir = path.dirname(circuitPath);
    const circuitBase = path.basename(circuitPath, ".circom");

    const wasm = path.join(circuitDir, `${circuitBase}_js`, `${circuitBase}.wasm`);
    const r1cs = path.join(circuitDir, `${circuitBase}.r1cs`);
    const ptau = path.join(circuitDir, "pot12_final.ptau");

    // Step 1: Verify required files exist
    for (const f of [wasm, r1cs, ptau]) {
      try {
        await fs.access(f);
      } catch {
        throw new Error(`Missing required file: ${f}`);
      }
    }

    // Step 2: Read snapshot data
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
    const amountPct = parseInt(amountPctStr, 10);
    const txPct = parseInt(txPctStr, 10);

    const totalWei = BigInt(snapshot.totals.nativeWei);
    const shownWei = (totalWei * BigInt(amountPct)) / 100n;

    const input = {
      totalWei: totalWei.toString(),
      shownWei: shownWei.toString(),
      amountPct,
      txPct,
    };
    const inputFile = path.join(circuitDir, "input.json");
    await fs.writeFile(inputFile, JSON.stringify(input, null, 2));

    // Step 3: Generate witness
    const witness = path.join(circuitDir, "witness.wtns");
    await exec("node", [`${circuitBase}_js/generate_witness.js`, wasm, inputFile, witness], circuitDir);

    // Step 4: Groth16 setup (one-time per circuit)
    const zkeyFinal = path.join(circuitDir, `${circuitBase}_final.zkey`);
    try {
      await fs.access(zkeyFinal);
    } catch {
      const zkey0 = path.join(circuitDir, `${circuitBase}_0.zkey`);
      await exec("npx", ["snarkjs", "groth16", "setup", r1cs, ptau, zkey0], circuitDir);
      await exec("npx", ["snarkjs", "zkey", "contribute", zkey0, zkeyFinal, "-v", "--name=contrib"], circuitDir);
    }

    // Step 5: Generate proof
    const proofPath = path.join(circuitDir, "proof.json");
    const publicPath = path.join(circuitDir, "public.json");
    await exec("npx", ["snarkjs", "groth16", "prove", zkeyFinal, witness, proofPath, publicPath], circuitDir);

    // Step 6: Export calldata
    const calldata = await new Promise((resolve, reject) => {
      const p = spawn("npx", ["snarkjs", "zkey", "export", "soliditycalldata", "public.json", "proof.json"], {
        cwd: circuitDir,
      });
      let out = "";
      p.stdout.on("data", (d) => (out += d.toString()));
      p.stderr.on("data", (d) => process.stderr.write(d.toString()));
      p.on("exit", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error("calldata export failed"))));
    });

    // Step 7: Write outputs to backend/.tmp
    await fs.copyFile(publicPath, outPublic);
    await fs.copyFile(proofPath, outProof);
    await fs.writeFile(outCalldata, calldata);

    console.log("✅ build-proof.js finished successfully");
    process.exit(0);
  } catch (e) {
    console.error("❌ build-proof.js error:", e.message);
    process.exit(1);
  }
}

await main();
