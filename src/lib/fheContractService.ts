import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

export class FheContractService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
    }
  }

  async getUSDCBalance(userAddress: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const usdcContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TestUSDC,
      CONTRACT_ABIS.TestUSDC,
      this.provider
    );
    
    const balance = await usdcContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  async getVaultUSDCBalance(): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const stadiumContract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    const balance = await stadiumContract.getUSDCBalance();
    return ethers.formatUnits(balance, 6);
  }

  async faucetUSDC(amount: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    const usdcContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TestUSDC,
      CONTRACT_ABIS.TestUSDC,
      this.signer
    );
    
    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await usdcContract.faucet(await this.signer.getAddress(), amountWei);
    await tx.wait();
  }

  async approveUSDC(spender: string, amount: string): Promise<void> {
    if (!this.signer) throw new Error('Signer not initialized');
    
    const usdcContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TestUSDC,
      CONTRACT_ABIS.TestUSDC,
      this.signer
    );
    
    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await usdcContract.approve(spender, amountWei);
    await tx.wait();
  }

  async placeBetWithFHE(
    gameId: number,
    amount: string,
    teamSelection: number,
    instance: FhevmInstance,
    signerPromise: Promise<any>
  ): Promise<number> {
    try {
      // Convert team selection to number
      const teamSelectionNum = Number(teamSelection);
      
      // Create encrypted input
      const input = instance.createEncryptedInput();
      
      // Add amount and team selection to encrypted input
      const amountBigInt = BigInt(ethers.parseUnits(amount, 6).toString());
      input.add32(amountBigInt);
      input.add8(teamSelectionNum);
      
      // Encrypt the input
      const encryptedInput = await input.encrypt();
      
      // Convert handles and proof to hex strings
      const handles = encryptedInput.handles.map(handle => `0x${handle.toString(16)}`);
      const inputProof = `0x${encryptedInput.inputProof.toString(16)}`;
      
      // Get signer
      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');
      
      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        CONTRACT_ABIS.StadiumVaultBet,
        signer
      );
      
      // First approve USDC transfer
      await this.approveUSDC(CONTRACT_ADDRESSES.StadiumVaultBet, amount);
      
      // Place bet with encrypted data
      const tx = await contract.placeBet(
        gameId,
        handles[0], // amount handle
        handles[1], // team selection handle
        inputProof
      );
      
      const receipt = await tx.wait();
      
      // Extract bet ID from events
      const betPlacedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'BetPlaced';
        } catch {
          return false;
        }
      });
      
      if (betPlacedEvent) {
        const parsed = contract.interface.parseLog(betPlacedEvent);
        return Number(parsed?.args.betId);
      }
      
      return 0; // Fallback
    } catch (error) {
      console.error('Error placing bet with FHE:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async placeBet(gameId: number, amount: string, teamSelection: number): Promise<number> {
    console.warn('Using legacy placeBet method. Consider using placeBetWithFHE for encrypted betting.');
    
    if (!this.signer) throw new Error('Signer not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.signer
    );
    
    // Approve USDC transfer
    await this.approveUSDC(CONTRACT_ADDRESSES.StadiumVaultBet, amount);
    
    // Place bet (this would need to be updated to handle non-FHE case)
    const tx = await contract.placeBet(gameId, amount, teamSelection);
    const receipt = await tx.wait();
    
    return receipt.logs.length > 0 ? 1 : 0; // Simplified return
  }

  async getGameCount(): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    return Number(await contract.getGameCount());
  }

  async getBetCount(): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    return Number(await contract.getBetCount());
  }
}

export const fheContractService = new FheContractService();