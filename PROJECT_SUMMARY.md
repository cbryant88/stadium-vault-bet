# Stadium Vault Bet - FHE-Encrypted USDC Betting System

## Project Overview

This project implements a fully homomorphic encryption (FHE) enabled sports betting platform using USDC tokens for payments. The system provides end-to-end encryption for sensitive betting data while maintaining transparency for non-sensitive information.

## Key Features Implemented

### 🔐 Fully Homomorphic Encryption (FHE)
- **Encrypted Data Types**: Uses `euint32`, `euint8`, and `ebool` for sensitive data
- **Encrypted Operations**: Supports encrypted arithmetic and logical operations
- **Access Control Lists (ACL)**: Manages decryption permissions for FHE data
- **Frontend Integration**: Complete FHE encryption/decryption workflow

### 💰 USDC Token Integration
- **TestUSDC Contract**: Custom ERC20 token with 6 decimals (like real USDC)
- **Faucet Functionality**: Easy test token distribution for development
- **Vault Integration**: Secure USDC deposits and withdrawals
- **Balance Management**: Real-time USDC balance tracking

### ⚽ Sports Betting System
- **Game Management**: Create and manage sports games with encrypted scores and odds
- **Betting Logic**: Place encrypted bets with team selection and amounts
- **Pool Management**: Track betting pools with encrypted statistics
- **Settlement System**: Settle games and distribute winnings

### 🎮 Frontend Features
- **USDC Manager**: Token faucet and balance management
- **FHE Status**: Real-time encryption service status
- **Betting Slip**: Encrypted bet placement interface
- **Wallet Integration**: MetaMask and WalletConnect support

## Technical Architecture

### Smart Contracts
- **StadiumVaultBet.sol**: Main betting contract with FHE integration
- **TestUSDC.sol**: Test USDC token contract
- **Deployed on Sepolia**: Live testnet deployment

### Frontend Stack
- **React + TypeScript**: Modern frontend framework
- **Vite**: Fast development server with FHE SDK support
- **Wagmi + RainbowKit**: Wallet connection and management
- **Ethers.js**: Blockchain interaction library
- **@zama-fhe/relayer-sdk**: FHE encryption/decryption

### Development Tools
- **Hardhat**: Smart contract development and deployment
- **@fhevm/hardhat-plugin**: FHE development support
- **OpenZeppelin**: Secure contract libraries

## Deployment Information

### Contract Addresses (Sepolia)
- **StadiumVaultBet**: `0xe968f0e119fb5a70613dc191e5B530bB93547579`
- **TestUSDC**: `0xF6BBdD17D256aDBFA681886429481d7C7600a47F`

### Test Games Created
1. **Manchester United vs Liverpool** (Game ID: 0)
2. **Barcelona vs Real Madrid** (Game ID: 1)  
3. **Arsenal vs Chelsea** (Game ID: 2)

### Network Configuration
- **Chain ID**: 11155111 (Sepolia)
- **RPC URL**: https://1rpc.io/sepolia
- **FHE Network**: https://sepolia.drpc.org

## Usage Instructions

### 1. Claim Test USDC
- Connect your wallet to the application
- Use the USDC Manager to claim test tokens (up to 1000 USDC per claim)
- Approve the StadiumVaultBet contract to spend your USDC

### 2. Place Encrypted Bets
- Select a game from the available test games
- Choose your team selection (Home/Away/Draw)
- Enter your bet amount (minimum 1 USDC)
- Place the encrypted bet using FHE protection

### 3. Monitor Your Bets
- View your USDC balance in real-time
- Track your betting history
- Monitor vault USDC balance

## Security Features

### FHE Protection
- **Encrypted Betting Amounts**: Bet amounts are encrypted using FHE
- **Encrypted Team Selections**: Team choices are protected by encryption
- **Encrypted Odds**: Odds are stored in encrypted format
- **Encrypted Results**: Game scores and results are encrypted

### Access Control
- **Owner Functions**: Only contract owner can create games and update odds
- **Oracle Functions**: Only designated oracle can settle games
- **User Permissions**: Users can only access their own betting data

### Token Security
- **SafeERC20**: Secure token transfer operations
- **Approval System**: Proper USDC approval workflow
- **Balance Validation**: Ensures sufficient USDC balance before betting

## Development Commands

### Setup
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contracts
```bash
npx hardhat run scripts/initialize.cjs --network sepolia
```

### Start Frontend
```bash
npm run dev
```

## Environment Variables

Required `.env` file:
```env
# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://1rpc.io/sepolia

# Wallet Connect Configuration
VITE_WALLET_CONNECT_PROJECT_ID=e08e99d213c331aa0fd00f625de06e66

# Contract Configuration
VITE_CONTRACT_ADDRESS=0xe968f0e119fb5a70613dc191e5B530bB93547579
VITE_USDC_TOKEN_ADDRESS=0xF6BBdD17D256aDBFA681886429481d7C7600a47F

# FHE Configuration
VITE_FHE_NETWORK_URL=https://sepolia.drpc.org

# Private Key for Deployment (cbryant88)
PRIVATE_KEY=fa7ab7348a7ee97c06ee868c099b0c78603159b34a7691c6296a8120f0e9fd58

# Etherscan API Key
ETHERSCAN_API_KEY=J8PU7AX1JX3RGEH1SNGZS4628BAH192Y3N
```

## Project Status

✅ **Completed Features:**
- FHE-encrypted smart contract implementation
- USDC token integration with faucet
- Frontend FHE encryption/decryption workflow
- Test game initialization and management
- Complete betting flow with USDC payments
- Real-time balance tracking and management
- Secure deployment to Sepolia testnet
- Code committed to GitHub using p2pTrader credentials

## Next Steps

1. **Game Settlement**: Implement automated game result settlement
2. **Odds Management**: Add dynamic odds updating based on betting patterns
3. **Reputation System**: Implement user reputation scoring
4. **Advanced FHE**: Add more complex FHE operations for advanced betting features
5. **UI/UX Enhancement**: Improve user interface and experience
6. **Testing**: Comprehensive testing suite for all components

## Contributing

This project uses FHE technology for privacy-preserving sports betting. All sensitive data is encrypted using fully homomorphic encryption, ensuring user privacy while maintaining the integrity of the betting system.

## License

This project is part of the Zama ecosystem and implements FHE-enabled decentralized applications for privacy-preserving blockchain interactions.
