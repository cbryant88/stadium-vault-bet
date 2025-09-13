import { Address } from 'viem';

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  StadiumVaultBet: '0x0000000000000000000000000000000000000000' as Address,
} as const;

// Contract ABIs will be generated after compilation
export const CONTRACT_ABIS = {
  StadiumVaultBet: [
    // GameCreated event
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "name": "gameId", "type": "uint256"},
        {"indexed": false, "name": "homeTeam", "type": "string"},
        {"indexed": false, "name": "awayTeam", "type": "string"}
      ],
      "name": "GameCreated",
      "type": "event"
    },
    // BetPlaced event
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "name": "betId", "type": "uint256"},
        {"indexed": true, "name": "gameId", "type": "uint256"},
        {"indexed": true, "name": "bettor", "type": "address"},
        {"indexed": false, "name": "amount", "type": "uint32"}
      ],
      "name": "BetPlaced",
      "type": "event"
    },
    // placeBet function
    {
      "inputs": [
        {"name": "gameId", "type": "uint256"},
        {"name": "amount", "type": "bytes"},
        {"name": "teamSelection", "type": "bytes"},
        {"name": "inputProof", "type": "bytes"}
      ],
      "name": "placeBet",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "payable",
      "type": "function"
    },
    // getGameInfo function
    {
      "inputs": [{"name": "gameId", "type": "uint256"}],
      "name": "getGameInfo",
      "outputs": [
        {"name": "homeTeam", "type": "string"},
        {"name": "awayTeam", "type": "string"},
        {"name": "homeScore", "type": "uint8"},
        {"name": "awayScore", "type": "uint8"},
        {"name": "homeOdds", "type": "uint8"},
        {"name": "awayOdds", "type": "uint8"},
        {"name": "drawOdds", "type": "uint8"},
        {"name": "isActive", "type": "bool"},
        {"name": "isFinished", "type": "bool"},
        {"name": "startTime", "type": "uint256"},
        {"name": "endTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111, // Sepolia
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY',
} as const;