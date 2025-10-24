const hre = require("hardhat");

async function main() {
  console.log("Deploying Verifier contract...");

  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();

  await verifier.waitForDeployment(); // modern await
  const address = await verifier.getAddress();

  console.log("Verifier deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
