# Vercel Deployment Guide for Stadium Vault Bet

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Prepare the required environment variables

## Step-by-Step Deployment Process

### Step 1: Connect GitHub Repository

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project" on the dashboard
   - Select "Import Git Repository"
   - Choose `cbryant88/stadium-vault-bet` from the list
   - Click "Import"

### Step 2: Configure Project Settings

1. **Project Configuration**
   - **Project Name**: `stadium-vault-bet` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. **Environment Variables Configuration**
   Click "Environment Variables" and add the following:

   ```
   VITE_CHAIN_ID=11155111
   VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
   VITE_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID
   VITE_INFURA_API_KEY=YOUR_INFURA_API_KEY
   ```

   **Important**: Make sure to add these for all environments (Production, Preview, Development)

### Step 3: Advanced Configuration

1. **Build Settings**
   - **Node.js Version**: 18.x (recommended)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. **Vite Configuration**
   The project is already configured with:
   - React SWC plugin for faster builds
   - Path aliases for clean imports
   - Global polyfills for wallet compatibility

### Step 4: Deploy

1. **Initial Deployment**
   - Click "Deploy" button
   - Wait for the build process to complete (usually 2-3 minutes)
   - Monitor the build logs for any errors

2. **Build Process**
   The deployment will:
   - Install dependencies from `package-lock.json`
   - Build the React application
   - Generate optimized production bundle
   - Deploy to Vercel's global CDN

### Step 5: Post-Deployment Configuration

1. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain if desired
   - Configure DNS settings as instructed

2. **Environment Variables Verification**
   - Verify all environment variables are properly set
   - Test wallet connection functionality
   - Ensure network configuration is correct

## Important Configuration Details

### Environment Variables Explained

- **VITE_CHAIN_ID**: Sepolia testnet chain ID (11155111)
- **VITE_RPC_URL**: Your Infura RPC endpoint for Sepolia
- **VITE_WALLET_CONNECT_PROJECT_ID**: Your WalletConnect project ID for wallet connections
- **VITE_INFURA_API_KEY**: Your Infura API key for blockchain interactions

### Build Configuration

The project uses:
- **Vite** as the build tool
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **RainbowKit** for wallet integration
- **Wagmi** for blockchain interactions

### Network Configuration

- **Primary Network**: Sepolia Testnet
- **RPC Provider**: Infura
- **Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are properly installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_` prefix
   - Verify variables are added to all environments
   - Check for typos in variable names

3. **Wallet Connection Issues**
   - Verify WalletConnect Project ID is correct
   - Check network configuration
   - Ensure RPC URL is accessible

### Build Logs

Monitor the build logs for:
- Dependency installation status
- TypeScript compilation errors
- Build optimization warnings
- Deployment success confirmation

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Wallet connection works
- [ ] Network switching functions properly
- [ ] All UI components render correctly
- [ ] Environment variables are accessible
- [ ] Build process completes without errors

## Performance Optimization

The deployment includes:
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **CDN Distribution**: Global content delivery
- **Caching**: Optimized caching strategies

## Security Considerations

- Environment variables are securely stored
- No sensitive data in client-side code
- HTTPS enforced by default
- Secure headers configured
- CSP (Content Security Policy) enabled

## Monitoring and Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Automatic error reporting
- **Performance Metrics**: Core Web Vitals tracking
- **Deployment History**: Version control and rollback capability

## Support and Maintenance

- **Automatic Deployments**: Deploy on every push to main branch
- **Preview Deployments**: Automatic previews for pull requests
- **Rollback Capability**: Easy rollback to previous versions
- **Monitoring**: Real-time performance and error monitoring

## Next Steps After Deployment

1. **Test All Functionality**
   - Wallet connection
   - Network switching
   - UI responsiveness
   - Error handling

2. **Configure Custom Domain** (if needed)
   - Add domain in Vercel dashboard
   - Update DNS settings
   - Verify SSL certificate

3. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Configure error tracking
   - Set up performance alerts

4. **Prepare for Production**
   - Deploy smart contracts to mainnet
   - Update contract addresses
   - Configure production environment variables

## Contact and Support

For deployment issues:
- Check Vercel documentation
- Review build logs
- Verify environment configuration
- Test locally before deploying

---

**Deployment URL**: Your application will be available at `https://stadium-vault-bet.vercel.app` (or your custom domain)

**Repository**: https://github.com/cbryant88/stadium-vault-bet

**Last Updated**: $(date)
