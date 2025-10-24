require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { ETHRPC_SEPOLIA, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: ETHRPC_SEPOLIA,
      accounts: [PRIVATE_KEY],
    },
  },
};
