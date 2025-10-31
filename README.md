# Stadium Vault Bet - FHE Encrypted Sports Betting Platform

<div align="center">

![Stadium Vault Bet](public/logo.svg)

**A revolutionary sports betting platform leveraging Fully Homomorphic Encryption (FHE) technology for complete privacy and security**

[Live Demo](https://stadium-vault-bet.vercel.app) | [Video Demo](./stadium-vault-bet.mov) | [Documentation](#)

</div>

## 📹 Demo Video

Watch the full demo video demonstrating all features of Stadium Vault Bet:

[![Demo Video](./stadium-vault-bet.mov)](./stadium-vault-bet.mov)

**Video Link**: [stadium-vault-bet.mov](./stadium-vault-bet.mov)

## 🎯 Project Overview

Stadium Vault Bet is a cutting-edge sports betting platform that leverages **Fully Homomorphic Encryption (FHE)** technology from Zama to ensure complete privacy and security for all betting activities. Built on the Sepolia testnet with Zama's FHE network, this platform allows users to place encrypted bets while maintaining complete anonymity.

### Key Features

- 🔐 **FHE Encryption**: All betting data (amounts, team selections, odds) is encrypted using Fully Homomorphic Encryption
- 🔒 **Privacy-First**: Complete anonymity for all betting activities - no one can see your bets until you decide to reveal them
- 💰 **Vault-Based Betting**: Secure vault system for managing USDC deposits and withdrawals
- 📊 **Real-time Betting Pools**: Encrypted betting pool statistics tracked on-chain
- 🎮 **Multi-Wallet Support**: Seamless integration with MetaMask and other Web3 wallets via RainbowKit
- ⚡ **Gas Efficient**: Optimized FHE operations for cost-effective transactions

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript + Vite
- shadcn/ui + Radix UI + Tailwind CSS
- RainbowKit + Wagmi + Viem for wallet integration

**Blockchain:**
- Solidity ^0.8.24
- Zama FHE Network (Sepolia)
- FHEVM Solidity SDK
- OpenZeppelin Contracts

**Smart Contracts:**
- `StadiumVaultBet.sol` - Main betting contract with FHE support
- `TestUSDC.sol` - ERC20 test token for betting (6 decimals)

## 📋 Smart Contracts

### StadiumVaultBet Contract

The main contract that handles all betting operations with FHE encryption.

**Location**: [`contracts/StadiumVaultBet.sol`](./contracts/StadiumVaultBet.sol)

**Key Features:**
- FHE-encrypted bet placement (amount, team selection)
- Encrypted betting pool management
- Vault-based USDC balance management
- Encrypted game scores and odds
- User reputation and statistics (all encrypted)

**Core Data Structures:**

```solidity
struct Bet {
    euint32 betId;           // Encrypted bet ID
    euint32 amount;           // Encrypted bet amount
    euint32 odds;             // Encrypted odds
    euint8 teamSelection;     // Encrypted: 0=home, 1=away, 2=draw
    ebool isWinner;           // Encrypted winner status
    bool isActive;
    bool isSettled;
    address bettor;
    uint256 gameId;
    uint256 timestamp;
}

struct Game {
    euint32 gameId;
    string homeTeam;
    string awayTeam;
    euint32 homeScore;        // Encrypted scores
    euint32 awayScore;
    euint32 homeOdds;         // Encrypted odds
    euint32 awayOdds;
    euint32 drawOdds;
    ebool isActive;
    ebool isFinished;
    uint256 startTime;
    uint256 endTime;
}

struct BettingPool {
    euint32 totalBets;        // All pool stats encrypted
    euint32 totalAmount;
    euint32 homeBets;
    euint32 awayBets;
    euint32 drawBets;
    euint32 homeTotalAmount;
    euint32 awayTotalAmount;
    euint32 drawTotalAmount;
}
```

**Main Functions:**
- `createGame()` - Create a new game (owner only)
- `placeBet()` - Place an encrypted bet using FHE handles and proof
- `depositToVault()` - Deposit USDC to user vault
- `withdrawFromVault()` - Withdraw USDC from user vault
- `settleGame()` - Settle game with encrypted scores (oracle only)
- `settleBet()` - Settle individual bet with encrypted winner status (oracle only)

### TestUSDC Contract

ERC20 test token for betting, with 6 decimals (matching USDC standard).

**Location**: [`contracts/TestUSDC.sol`](./contracts/TestUSDC.sol)

**Features:**
- Standard ERC20 implementation
- 6 decimal places (USDC standard)
- Faucet function for testing (max 1000 USDC per call)
- Initial mint: 1M test USDC to owner

## 🔐 FHE Encryption & Decryption Logic

### Encryption Flow (Placing a Bet)

When a user places a bet, the following encryption process occurs:

```typescript
// 1. Create FHE Instance (using Zama SDK)
const instance = await createInstance(SepoliaConfig);

// 2. Create Encrypted Input
const input = instance.createEncryptedInput(
  CONTRACT_ADDRESS,
  userAddress
);

// 3. Add Betting Data (encrypted)
const amountBigInt = BigInt(ethers.parseUnits(amount, 6).toString());
input.add32(amountBigInt);           // Encrypt bet amount (32-bit)
input.add8(teamSelectionNum);        // Encrypt team selection (8-bit: 0/1/2)

// 4. Encrypt and Generate Proof
const encryptedInput = await input.encrypt();

// 5. Convert to Contract Format
const handles = encryptedInput.handles.map(handle => convertHex(handle));
const inputProof = `0x${Array.from(encryptedInput.inputProof)
  .map(b => b.toString(16).padStart(2, '0')).join('')}`;

// 6. Submit to Contract
await contract.placeBet(
  gameId,
  handles,      // Encrypted handles array
  inputProof,   // Encryption proof
  usdcAmount    // Plain amount for vault deduction
);
```

**Key Points:**
- **Amount**: Encrypted as `euint32` (32-bit encrypted integer)
- **Team Selection**: Encrypted as `euint8` (0 = home, 1 = away, 2 = draw)
- **Proof**: Cryptographic proof ensuring encryption correctness
- **Handles**: Encrypted data handles that can be operated on in FHE

### Decryption Flow (Viewing Bet Data)

When a user wants to decrypt their bet data:

```typescript
// 1. Get Encrypted Data from Contract
const encryptedData = await contract.getBetEncryptedData(betId);
// Returns: { amount, odds, teamSelection, isWinner } as bytes32

// 2. Generate Keypair for Decryption
const keypair = instance.generateKeypair();

// 3. Create EIP712 Signature Request
const eip712 = instance.createEIP712(
  keypair.publicKey,
  [CONTRACT_ADDRESS],
  startTimestamp,
  durationDays
);

// 4. Sign Typed Data (user authorizes decryption)
const signature = await signer.signTypedData({
  domain: eip712.domain,
  types: eip712.types,
  primaryType: 'UserDecryptRequestVerification',
  message: eip712.message
});

// 5. Decrypt Handles
const handlePairs = [
  { handle: encryptedData.amount, contractAddress: CONTRACT_ADDRESS },
  { handle: encryptedData.odds, contractAddress: CONTRACT_ADDRESS },
  { handle: encryptedData.teamSelection, contractAddress: CONTRACT_ADDRESS },
  { handle: encryptedData.isWinner, contractAddress: CONTRACT_ADDRESS }
];

const decrypted = await instance.userDecrypt(
  handlePairs,
  keypair.privateKey,
  keypair.publicKey,
  signature.replace(/^0x/, ''),
  [CONTRACT_ADDRESS],
  userAddress,
  startTimestamp,
  durationDays
);

// 6. Extract Decrypted Values
const amount = decrypted[encryptedData.amount];
const odds = decrypted[encryptedData.odds];
const teamSelection = decrypted[encryptedData.teamSelection];
const isWinner = decrypted[encryptedData.isWinner];
```

**Key Points:**
- **User Authorization**: User must sign EIP712 message to authorize decryption
- **Temporal Access**: Decryption permission has expiration (default 10 days)
- **Selective Decryption**: Users can only decrypt their own bet data (ACL-controlled)
- **Privacy Preserved**: Only authorized users can decrypt specific data

### ACL (Access Control List) System

The contract implements FHE ACL for fine-grained access control:

```solidity
// Contract can access its own data
FHE.allowThis(bets[betId].amount);

// Specific user can decrypt their bet data
FHE.allow(bets[betId].amount, msg.sender);
FHE.allow(bets[betId].odds, msg.sender);
FHE.allow(bets[betId].teamSelection, msg.sender);
FHE.allow(bets[betId].isWinner, msg.sender);
```

**Access Control:**
- **Contract (`allowThis`)**: Contract can perform FHE operations on encrypted data
- **User (`allow`)**: Specific user can decrypt their authorized data
- **Privacy**: Unauthorized users cannot decrypt data they don't have access to

### FHE Operations in Contract

The contract performs various FHE operations on encrypted data:

```solidity
// Addition: Add encrypted bet amounts
pool.totalAmount = FHE.add(pool.totalAmount, internalAmount);

// Selection: Choose odds based on encrypted team selection
euint32 selectedOdds = FHE.select(
  FHE.eq(internalTeamSelection, FHE.asEuint8(0)), // home
  game.homeOdds,
  FHE.select(
    FHE.eq(internalTeamSelection, FHE.asEuint8(1)), // away
    game.awayOdds,
    game.drawOdds // draw
  )
);

// Comparison: Determine winner based on encrypted scores
ebool isHomeWinner = FHE.gt(homeScore, awayScore);
```

**Supported FHE Operations:**
- `FHE.add()` - Add encrypted values
- `FHE.select()` - Conditional selection (if-else)
- `FHE.eq()` - Equality comparison
- `FHE.gt()` / `FHE.lt()` - Greater/less than comparison
- `FHE.fromExternal()` - Convert external encrypted input to internal

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (for gas fees)

### Installation

```bash
# Clone the repository
git clone https://github.com/cbryant88/stadium-vault-bet.git

# Navigate to the project directory
cd stadium-vault-bet

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://1rpc.io/sepolia

# Wallet Connect Configuration
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Contract Configuration
VITE_CONTRACT_ADDRESS=0x81C6B05D115838816B2D6E11162d533A6510a57B
VITE_USDC_TOKEN_ADDRESS=0x9B89A787e6012d47459fDD71225155Df0C733Ba6

# FHE Configuration
VITE_FHE_NETWORK_URL=https://sepolia.drpc.org
```

### Deployed Contracts (Sepolia Testnet)

- **StadiumVaultBet**: `0x81C6B05D115838816B2D6E11162d533A6510a57B`
- **TestUSDC**: `0x9B89A787e6012d47459fDD71225155Df0C733Ba6`

## 📖 Usage Guide

### 1. Connect Wallet

1. Click "Connect Wallet" in the header
2. Select MetaMask or your preferred wallet
3. Approve connection and switch to Sepolia testnet

### 2. Claim Test USDC

1. Navigate to USDC Manager section
2. Enter amount (max 1000 USDC)
3. Click "Claim USDC"
4. Approve MetaMask transaction

### 3. Deposit to Vault

1. In USDC Manager, enter deposit amount
2. Click "Deposit"
3. Approve USDC transfer (first time only)
4. Confirm deposit transaction

### 4. Create a Game (Owner Only)

1. Navigate to Create Game section
2. Enter home team, away team
3. Set start time and duration
4. Click "Create Game"
5. Approve MetaMask transaction

### 5. Place an Encrypted Bet

1. Select a game from Available Games
2. Choose team (Home/Away/Draw) and amount
3. Click "Place Encrypted Bets"
4. Approve MetaMask transaction
5. Wait for encryption and submission

**Note**: Betting uses vault balance, not wallet balance. Deposit to vault first.

### 6. View Your Bets

Navigate to "Your Bets" section to see all your placed bets (encrypted data visible after decryption).

## 🏗️ Project Structure

```
stadium-vault-bet/
├── contracts/              # Solidity smart contracts
│   ├── StadiumVaultBet.sol # Main betting contract
│   └── TestUSDC.sol        # Test USDC token
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── BettingSlip.tsx
│   │   ├── CreateGame.tsx
│   │   ├── GamesList.tsx
│   │   ├── USDCManager.tsx
│   │   └── WalletConnect.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useBetting.ts
│   │   ├── useEthersSigner.ts
│   │   ├── useVault.ts
│   │   └── useZamaInstance.ts
│   ├── lib/               # Core utilities
│   │   ├── fheContractService.ts  # FHE contract interactions
│   │   ├── contracts.ts   # Contract ABIs and addresses
│   │   └── wallet.ts      # Wallet configuration
│   └── pages/
│       └── Index.tsx       # Main page
├── scripts/               # Deployment scripts
│   ├── deploy.cjs
│   └── initialize.cjs
└── README.md
```

## 🔒 Security Features

- **FHE Encryption**: All sensitive betting data encrypted with Zama's FHE
- **Zero-Knowledge Proofs**: Cryptographic proofs ensure data integrity
- **ACL System**: Fine-grained access control for encrypted data
- **Vault System**: Secure USDC management with on-chain vault
- **Wallet Integration**: Secure connection via RainbowKit/Wagmi
- **On-chain Privacy**: All sensitive operations maintain privacy on blockchain

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contract Deployment

```bash
# Deploy contracts
npx hardhat run scripts/deploy.cjs --network sepolia

# Initialize contract (optional)
npx hardhat run scripts/initialize.cjs --network sepolia
```

## 📦 Deployment

### Vercel Deployment

The project is configured for automatic Vercel deployment:

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Configuration** (`vercel.json`):
- COOP/COEP headers for FHE SDK compatibility
- SPA routing support
- Environment variables injection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHE technology and SDK
- [RainbowKit](https://www.rainbowkit.com/) for wallet integration
- [OpenZeppelin](https://www.openzeppelin.com/) for secure smart contracts
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

For support and questions:
- Open an issue on [GitHub](https://github.com/cbryant88/stadium-vault-bet/issues)
- Contact the development team

## 🗺️ Roadmap

- [ ] Multi-sport support expansion
- [ ] Advanced betting options (parlays, futures)
- [ ] Mobile app development
- [ ] Cross-chain integration
- [ ] Enhanced privacy features
- [ ] Real-time odds updates
- [ ] Social betting features

---

<div align="center">

**Built with ❤️ using Zama FHE Technology**

[GitHub](https://github.com/cbryant88/stadium-vault-bet) | [Demo](https://stadium-vault-bet.vercel.app) | [Video](./stadium-vault-bet.mov)

</div>
