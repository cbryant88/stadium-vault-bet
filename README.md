# Stadium Vault Bet - FHE Encrypted Sports Betting Platform

## Project Overview

Stadium Vault Bet is a revolutionary sports betting platform that leverages Fully Homomorphic Encryption (FHE) technology to ensure complete privacy and security for all betting activities. Built on the Zama network, this platform allows users to place encrypted bets while maintaining complete anonymity.

## Key Features

- **FHE Encryption**: All betting data is encrypted using Fully Homomorphic Encryption
- **Privacy-First**: Complete anonymity for all betting activities
- **Real-time Odds**: Live sports betting with dynamic odds updates
- **Secure Wallet Integration**: Multiple wallet support with secure connection
- **Blockchain Integration**: All bets are recorded on-chain with FHE protection

## Technologies Used

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Blockchain**: Zama FHE Network, Sepolia Testnet
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Smart Contracts**: Solidity with FHE support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

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

Create a `.env.local` file in the root directory with the following variables:

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475

# Infura Configuration (Optional)
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia
```

## Smart Contract Integration

The platform integrates with FHE-enabled smart contracts that handle:

- Encrypted bet placement
- Secure fund management
- Anonymous result verification
- Privacy-preserving payouts

## Security Features

- **FHE Encryption**: All sensitive data is encrypted using Fully Homomorphic Encryption
- **Zero-Knowledge Proofs**: Verification without revealing underlying data
- **Secure Wallet Integration**: Multiple wallet providers supported
- **On-chain Privacy**: All transactions maintain privacy on the blockchain

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main header component
│   ├── WalletConnect.tsx # Wallet connection component
│   ├── Scoreboard.tsx  # Live sports scoreboard
│   └── BettingSlip.tsx # Betting interface
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── pages/              # Page components
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to your preferred hosting platform
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Multi-sport support expansion
- [ ] Advanced betting options
- [ ] Mobile app development
- [ ] Cross-chain integration
- [ ] Enhanced privacy features