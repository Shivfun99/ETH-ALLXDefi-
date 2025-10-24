// backend/scripts/fetch-balances.js
// Usage: node scripts/fetch-balances.js /path/to/snapshot.json ethereum 0x.. 0x..

import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import { ethers } from "ethers";

// Confirm .env loaded
const rpc = process.env.ETHRPC;
console.log("ETHRPC endpoint:", rpc);

// Validate RPC
if (!rpc || rpc.includes("ankr.com/eth")) {
  console.error("❌ Invalid ETHRPC. Please set a valid Alchemy or Infura endpoint in your .env file.");
  process.exit(1);
}

const [, , outPath, chain, ...addresses] = process.argv;

if (!outPath || !chain || addresses.length === 0) {
  console.error("Usage: node scripts/fetch-balances.js <outPath> <chain> <address1> <address2> ...");
  process.exit(1);
}

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(rpc);

    let total = 0n;
    const walletEntries = [];

    for (const addr of addresses) {
      console.log(`⛓ Fetching balance for ${addr}...`);
      const bal = await provider.getBalance(addr);
      walletEntries.push({ address: addr, balance: bal.toString() });
      total += bal;
    }

    // Mock transaction stats (placeholder for now)
    const txCount = walletEntries.length * 10;
    const txValuesSum = walletEntries.length * 1e15;

    const snapshot = {
      chain,
      wallets: walletEntries,
      totals: {
        nativeWei: total.toString(),
        txCount,
        txValuesSum,
      },
    };

    await fs.mkdir(outPath.substring(0, outPath.lastIndexOf("/")), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(snapshot, null, 2));

    console.log(`✅ Snapshot written successfully to ${outPath}`);
  } catch (e) {
    console.error("❌ Error fetching balances:", e.message);
    process.exit(1);
  }
}

main();
