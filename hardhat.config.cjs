require('dotenv').config();
const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("@fhevm/hardhat-plugin");

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    },
  },
  networks: {
    sepolia: {
      url: "https://1rpc.io/sepolia",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  fhevm: {
    network: "sepolia",
  },
  // Add FHE support for local testing
  localhost: {
    url: "http://127.0.0.1:8545",
    fhevm: {
      enabled: true
    }
  },
};

module.exports = config;
