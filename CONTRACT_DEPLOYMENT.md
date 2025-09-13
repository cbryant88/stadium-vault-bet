# Stadium Vault Bet - FHE Contract Deployment Guide

## Overview

This document provides instructions for deploying the FHE-encrypted Stadium Vault Bet smart contract to the Zama Sepolia testnet.

## Prerequisites

1. **Node.js 18+** and npm
2. **Hardhat** development environment
3. **Zama Sepolia Testnet** access
4. **FHEVM** dependencies installed
5. **Private key** for deployment account
6. **Sepolia ETH** for gas fees

## Contract Features

The StadiumVaultBet contract implements:

- **FHE Encrypted Betting**: All bet amounts and selections are encrypted using Fully Homomorphic Encryption
- **Game Management**: Create and manage sports games with encrypted scores and odds
- **Betting Pools**: Track encrypted betting pools for each game
- **User Reputation**: Encrypted user reputation and statistics
- **Oracle Integration**: Secure oracle system for game results
- **Privacy Protection**: Complete privacy for all betting activities

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install FHEVM Dependencies**
   ```bash
   npm install @fhevm/hardhat @fhevm/solidity
   ```

## Configuration

1. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
   ```

2. **Hardhat Configuration**
   The `hardhat.config.ts` file is already configured for:
   - Solidity 0.8.24
   - FHEVM integration
   - Sepolia network
   - Optimized compilation

## Deployment Steps

### Step 1: Compile Contracts

```bash
npm run compile
```

This will compile the StadiumVaultBet contract and generate the necessary artifacts.

### Step 2: Deploy to Sepolia

```bash
npm run deploy
```

This will deploy the contract to the Sepolia testnet.

### Step 3: Verify Deployment

After deployment, you'll see output similar to:
```
StadiumVaultBet deployed to: 0x1234567890123456789012345678901234567890
Deployer: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### Step 4: Update Contract Address

Update the contract address in `src/lib/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  StadiumVaultBet: '0x1234567890123456789012345678901234567890' as Address,
} as const;
```

## Contract Functions

### Owner Functions

- `createGame(string homeTeam, string awayTeam, uint256 startTime, uint256 endTime)`
- `setOracle(address _oracle)`
- `withdrawFunds(uint256 amount)`

### Oracle Functions

- `updateOdds(uint256 gameId, externalEuint32 homeOdds, externalEuint32 awayOdds, externalEuint32 drawOdds, bytes inputProof)`
- `settleGame(uint256 gameId, externalEuint32 homeScore, externalEuint32 awayScore, bytes inputProof)`
- `settleBet(uint256 betId, bool isWinner, externalEuint32 payout, bytes inputProof)`
- `updateUserReputation(address user, euint32 reputation)`

### Public Functions

- `placeBet(uint256 gameId, externalEuint32 amount, externalEuint8 teamSelection, bytes inputProof)`
- `getGameInfo(uint256 gameId)`
- `getBetInfo(uint256 betId)`
- `getUserStats(address user)`
- `getBettingPoolInfo(uint256 gameId)`

## FHE Integration

### Encrypted Data Types

- `euint32`: Encrypted 32-bit integers for amounts, scores, odds
- `euint8`: Encrypted 8-bit integers for team selections
- `ebool`: Encrypted boolean values
- `externalEuint32`: External encrypted values with proofs

### FHE Operations

The contract uses FHE operations for:
- Encrypted arithmetic (addition, multiplication)
- Encrypted comparisons
- Encrypted data storage and retrieval
- Privacy-preserving computations

## Security Considerations

1. **Oracle Security**: Only authorized oracles can update game data
2. **Access Control**: Owner and oracle functions are properly protected
3. **FHE Encryption**: All sensitive data is encrypted using FHE
4. **Input Validation**: All inputs are validated before processing
5. **Gas Optimization**: Contract is optimized for gas efficiency

## Testing

### Local Testing

```bash
npm run deploy:local
```

This deploys to a local Hardhat network for testing.

### Test Functions

1. **Create a Game**
   ```javascript
   await contract.createGame("Lakers", "Warriors", startTime, endTime);
   ```

2. **Place a Bet**
   ```javascript
   await contract.placeBet(gameId, encryptedAmount, encryptedSelection, proof);
   ```

3. **Settle a Game**
   ```javascript
   await contract.settleGame(gameId, encryptedHomeScore, encryptedAwayScore, proof);
   ```

## Integration with Frontend

The frontend integrates with the contract through:

1. **Contract Service**: `src/lib/fheContractService.ts`
2. **Wallet Integration**: RainbowKit and Wagmi
3. **FHE Operations**: Encrypted data handling
4. **Event Listening**: Real-time updates from contract events

## Monitoring and Maintenance

### Contract Events

Monitor these events for contract activity:
- `GameCreated`: New games created
- `BetPlaced`: New bets placed
- `GameSettled`: Games completed
- `BetSettled`: Bets resolved
- `ReputationUpdated`: User reputation changes

### Gas Optimization

The contract is optimized for:
- Efficient FHE operations
- Minimal gas consumption
- Scalable betting pools
- Fast transaction processing

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Ensure FHEVM dependencies are installed
   - Check Solidity version compatibility
   - Verify import paths

2. **Deployment Failures**
   - Check private key configuration
   - Verify Sepolia ETH balance
   - Ensure RPC URL is correct

3. **FHE Operation Errors**
   - Verify FHEVM network configuration
   - Check encrypted data format
   - Ensure proper proof generation

### Support

For deployment issues:
- Check Hardhat documentation
- Review FHEVM integration guide
- Verify network configuration
- Test on local network first

## Next Steps

After successful deployment:

1. **Update Frontend**: Update contract address in frontend
2. **Configure Oracle**: Set up oracle service for game data
3. **Test Integration**: Verify frontend-contract integration
4. **Monitor Performance**: Track contract performance and gas usage
5. **Scale Operations**: Prepare for mainnet deployment

---

**Contract Address**: Update after deployment
**Network**: Zama Sepolia Testnet
**Last Updated**: $(date)
