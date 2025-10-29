// Auto-generated contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  StadiumVaultBet: "0x81C6B05D115838816B2D6E11162d533A6510a57B",
  TestUSDC: "0x9B89A787e6012d47459fDD71225155Df0C733Ba6",
};

export const CONTRACT_ABIS = {
  StadiumVaultBet: [
    {
      "inputs": [
        {"internalType": "address", "name": "_oracle", "type": "address"},
        {"internalType": "address", "name": "_usdcToken", "type": "address"}
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "MIN_BET_AMOUNT",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_BET_AMOUNT",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string", "name": "_homeTeam", "type": "string"},
        {"internalType": "string", "name": "_awayTeam", "type": "string"},
        {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "_endTime", "type": "uint256"}
      ],
      "name": "createGame",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "uint256", "name": "gameId", "type": "uint256"},
        {"internalType": "bytes32[]", "name": "handles", "type": "bytes32[]"},
        {"internalType": "bytes", "name": "inputProof", "type": "bytes"},
        {"internalType": "uint256", "name": "usdcAmount", "type": "uint256"}
      ],
      "name": "placeBet",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
      "name": "depositToVault",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getVaultBalance",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
      "name": "withdrawFromVault",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "name": "games",
      "outputs": [
        {"internalType": "bytes32", "name": "gameId", "type": "bytes32"},
        {"internalType": "string", "name": "homeTeam", "type": "string"},
        {"internalType": "string", "name": "awayTeam", "type": "string"},
        {"internalType": "bytes32", "name": "homeScore", "type": "bytes32"},
        {"internalType": "bytes32", "name": "awayScore", "type": "bytes32"},
        {"internalType": "bytes32", "name": "homeOdds", "type": "bytes32"},
        {"internalType": "bytes32", "name": "awayOdds", "type": "bytes32"},
        {"internalType": "bytes32", "name": "drawOdds", "type": "bytes32"},
        {"internalType": "bytes32", "name": "isActive", "type": "bytes32"},
        {"internalType": "bytes32", "name": "isFinished", "type": "bytes32"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "name": "bets",
      "outputs": [
        {"internalType": "bytes32", "name": "betId", "type": "bytes32"},
        {"internalType": "bytes32", "name": "amount", "type": "bytes32"},
        {"internalType": "bytes32", "name": "odds", "type": "bytes32"},
        {"internalType": "bytes32", "name": "teamSelection", "type": "bytes32"},
        {"internalType": "bytes32", "name": "isWinner", "type": "bytes32"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isSettled", "type": "bool"},
        {"internalType": "address", "name": "bettor", "type": "address"},
        {"internalType": "uint256", "name": "gameId", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
      "name": "getGameBasicInfo",
      "outputs": [
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isFinished", "type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "betId", "type": "uint256"}],
      "name": "getBetBasicInfo",
      "outputs": [
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "bool", "name": "isSettled", "type": "bool"},
        {"internalType": "address", "name": "bettor", "type": "address"},
        {"internalType": "uint256", "name": "gameId", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGameCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBetCount",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUSDCBalance",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getUserUSDCBalance",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  TestUSDC: [
    {
      "inputs": [{"internalType": "address", "name": "initialOwner", "type": "address"}],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "faucet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "spender", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "from", "type": "address"},
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "transferFrom",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
};