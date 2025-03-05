require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

RPC_URL = process.env.RPC_URL;
PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
        details: { yul: false },
      },
    }
  },
  networks: {
    localhost: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 2100000, // You can adjust gas limit as needed
      gasPrice: 8000000000, // You can adjust gas price as needed
      loggingEnabled: true, // 启用详细日志
    },
  },
};