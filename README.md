**Project 1**: ZK Private Share Verifier
A privacy-preserving DeFi portfolio sharing dApp built with React (Vite), Node.js (Express), Hardhat smart contracts, Circom/snarkjs for zero-knowledge proofs.

**Prerequisites**: node -v # v18+ required npm -v circom --version # should print 2.x.x snarkjs --version # should print 0.7.x

**Backend** Setup cd backend npm install cp .env.example .env

**.env config:** ETHRPC=https://eth-mainnet.g.alchemy.com/v2/key ETHRPC_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/key PRIVATE_KEY=key

**Circuit Compilation** bash scripts/compile-circuit.sh

Expected output in circuits/build/: revealpercent.r1cs revealpercent.wasm revealpercent.zkey verification_key.json

**Run Backend Server** cd backend npm run dev # uses nodemon

or
node server.js so Backend running on port 4000

**Frontend Setup Frontend Setup**

optional: Test Proof Generation cd backend node scripts/build-proof.js verify: npx snarkjs groth16 verify
circuits/build/verification_key.json
circuits/build/public.json
circuits/build/proof.json Expected: OK! Proof is valid Smart Contract Deployment npx hardhat compile npx hardhat run scripts/deploy-verifier.js --network localhost

Summary of Required Commands

**From project root
sudo npm install -g circom snarkjs

Step 1: Install deps
cd backend && npm install && cd ../frontend && npm install

Step 2: Compile circuit
bash scripts/compile-circuit.sh

Step 3: Run backend
cd backend && npm run dev

Step 4: Run frontend
cd frontend && npm run dev References**

**Circom documentation: https://docs.circom.io
snarkjs usage: https://github.com/iden3/snarkjs
Lit Protocol SDK docs: https://developer.litprotocol.com
Hardhat docs: https://hardhat.org**
