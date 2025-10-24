const hre = require("hardhat");

async function main() {
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  console.log("Verifier deployed to:", verifier.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
