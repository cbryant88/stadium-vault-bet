import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

export interface FHEGame {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isFinished: boolean;
}

export interface FHEBet {
  id: number;
  gameId: number;
  amount: number;
  teamSelection: 'home' | 'away' | 'draw';
  odds: number;
  isWinner: boolean;
  isActive: boolean;
  isSettled: boolean;
  bettor: string;
  timestamp: number;
}

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

  // Get all games
  async getGames(): Promise<FHEGame[]> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    try {
      const gameCount = await this.getGameCount();
      console.log('Game count from contract:', gameCount);
      
      // If no games in contract, return mock games for testing
      if (gameCount === 0) {
        console.log('No games in contract, returning mock games');
        return [
          {
            id: 0,
            homeTeam: "Manchester United",
            awayTeam: "Liverpool",
            startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            endTime: Math.floor(Date.now() / 1000) + 7200,   // 2 hours from now
            isActive: true,
            isFinished: false
          },
          {
            id: 1,
            homeTeam: "Barcelona",
            awayTeam: "Real Madrid",
            startTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
            endTime: Math.floor(Date.now() / 1000) + 10800,  // 3 hours from now
            isActive: true,
            isFinished: false
          },
          {
            id: 2,
            homeTeam: "Arsenal",
            awayTeam: "Chelsea",
            startTime: Math.floor(Date.now() / 1000) + 10800, // 3 hours from now
            endTime: Math.floor(Date.now() / 1000) + 14400,   // 4 hours from now
            isActive: true,
            isFinished: false
          }
        ];
      }
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        CONTRACT_ABIS.StadiumVaultBet,
        this.provider
      );
      
      const games: FHEGame[] = [];
      
      for (let i = 0; i < gameCount; i++) {
        try {
          const gameData = await contract.games(i);
          const basicInfo = await contract.getGameBasicInfo(i);
          
          games.push({
            id: i,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            startTime: Number(basicInfo.startTime),
            endTime: Number(basicInfo.endTime),
            isActive: basicInfo.isActive,
            isFinished: basicInfo.isFinished
          });
        } catch (error) {
          console.warn(`Failed to load game ${i}:`, error);
        }
      }
      
      return games;
    } catch (error) {
      console.error('Error loading games:', error);
      // Return mock games as fallback
      return [
        {
          id: 0,
          homeTeam: "Manchester United",
          awayTeam: "Liverpool",
          startTime: Math.floor(Date.now() / 1000) + 3600,
          endTime: Math.floor(Date.now() / 1000) + 7200,
          isActive: true,
          isFinished: false
        },
        {
          id: 1,
          homeTeam: "Barcelona",
          awayTeam: "Real Madrid",
          startTime: Math.floor(Date.now() / 1000) + 7200,
          endTime: Math.floor(Date.now() / 1000) + 10800,
          isActive: true,
          isFinished: false
        },
        {
          id: 2,
          homeTeam: "Arsenal",
          awayTeam: "Chelsea",
          startTime: Math.floor(Date.now() / 1000) + 10800,
          endTime: Math.floor(Date.now() / 1000) + 14400,
          isActive: true,
          isFinished: false
        }
      ];
    }
  }

  // Get user bets
  async getUserBets(userAddress: string): Promise<FHEBet[]> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    try {
      const betCount = await this.getBetCount();
      const userBets: FHEBet[] = [];
      
      for (let i = 0; i < betCount; i++) {
        try {
          const betData = await contract.bets(i);
          const basicInfo = await contract.getBetBasicInfo(i);
          
          // Check if this bet belongs to the user
          if (betData.bettor.toLowerCase() === userAddress.toLowerCase()) {
            userBets.push({
              id: i,
              gameId: Number(basicInfo.gameId),
              amount: 0, // Encrypted, would need decryption
              teamSelection: 'home', // Placeholder, would need decryption
              odds: 0, // Encrypted, would need decryption
              isWinner: false, // Encrypted, would need decryption
              isActive: basicInfo.isActive,
              isSettled: basicInfo.isSettled,
              bettor: betData.bettor,
              timestamp: Number(basicInfo.timestamp)
            });
          }
        } catch (error) {
          console.warn(`Failed to load bet ${i}:`, error);
        }
      }
      
      return userBets;
    } catch (error) {
      console.error('Error loading user bets:', error);
      throw error;
    }
  }

  // Get betting pool for a game
  async getBettingPool(gameId: number): Promise<any> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    try {
      const poolData = await contract.bettingPools(gameId);
      return {
        totalBets: 0, // Encrypted, would need decryption
        totalAmount: 0, // Encrypted, would need decryption
        homeBets: 0, // Encrypted, would need decryption
        awayBets: 0, // Encrypted, would need decryption
        drawBets: 0, // Encrypted, would need decryption
        homeTotalAmount: 0, // Encrypted, would need decryption
        awayTotalAmount: 0, // Encrypted, would need decryption
        drawTotalAmount: 0 // Encrypted, would need decryption
      };
    } catch (error) {
      console.error('Error loading betting pool:', error);
      throw error;
    }
  }
}

export const fheContractService = new FheContractService();