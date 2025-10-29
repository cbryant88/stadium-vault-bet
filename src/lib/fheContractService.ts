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
      
      // Get signer first to get user address
      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');
      
      const userAddress = await signer.getAddress();
      console.log('📊 User address:', userAddress);
      
      // Create encrypted input with contract address and user address
      console.log('🔄 Creating encrypted input...');
      const input = instance.createEncryptedInput(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        userAddress
      );
      console.log('✅ Encrypted input created');
      
      // Add amount and team selection to encrypted input
      const amountBigInt = BigInt(ethers.parseUnits(amount, 6).toString());
      console.log('📊 Adding amount:', amountBigInt.toString());
      input.add32(amountBigInt);
      
      console.log('📊 Adding team selection:', teamSelectionNum);
      input.add8(teamSelectionNum);
      
      // Encrypt the input
      console.log('🔄 Encrypting input...');
      const encryptedInput = await input.encrypt();
      console.log('✅ Input encrypted successfully');
      
      // Convert handles and proof to hex strings
      const handles = encryptedInput.handles.map(handle => {
        const hex = `0x${handle.toString(16)}`;
        console.log('📊 Handle:', hex.substring(0, 10) + '...');
        return hex;
      });
      
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
      console.log('📊 Proof length:', inputProof.length);
      
      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        CONTRACT_ABIS.StadiumVaultBet,
        signer
      );
      
      // First approve USDC transfer
      console.log('🔄 Approving USDC transfer...');
      await this.approveUSDC(CONTRACT_ADDRESSES.StadiumVaultBet, amount);
      console.log('✅ USDC transfer approved');
      
      // Place bet with encrypted data
      console.log('🔄 Placing bet on contract...');
      const tx = await contract.placeBet(
        gameId,
        handles[0], // amount handle
        handles[1], // team selection handle
        inputProof
      );
      
      console.log('🔄 Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed');
      
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
        const betId = Number(parsed?.args.betId);
        console.log('✅ Bet placed successfully, ID:', betId);
        return betId;
      }
      
      // Fallback: return the current bet count - 1
      const betCount = await this.getBetCount();
      console.log('⚠️ Using fallback bet ID:', betCount - 1);
      return betCount - 1;
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

  // Get all games from contract
  async getGames(): Promise<FHEGame[]> {
    if (!this.provider) throw new Error('Provider not initialized');
    
    try {
      const gameCount = await this.getGameCount();
      console.log('Game count from contract:', gameCount);
      
      if (gameCount === 0) {
        console.log('No games in contract, returning mock games for testing');
        // Return mock games for testing when contract has no games
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 24 * 60 * 60;
        const gameDuration = 2 * 60 * 60;
        
        return [
          {
            id: 0,
            homeTeam: "Manchester United",
            awayTeam: "Liverpool",
            startTime: now + (7 * oneDay),
            endTime: now + (7 * oneDay) + gameDuration,
            isActive: true,
            isFinished: false
          },
          {
            id: 1,
            homeTeam: "Barcelona",
            awayTeam: "Real Madrid",
            startTime: now + (14 * oneDay),
            endTime: now + (14 * oneDay) + gameDuration,
            isActive: true,
            isFinished: false
          },
          {
            id: 2,
            homeTeam: "Arsenal",
            awayTeam: "Chelsea",
            startTime: now + (21 * oneDay),
            endTime: now + (21 * oneDay) + gameDuration,
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
          
          const startTime = Number(basicInfo.startTime.toString());
          const endTime = Number(basicInfo.endTime.toString());
          
          // Validate timestamps - if they're too small (like 0 or very small numbers), use fallback
          const now = Math.floor(Date.now() / 1000);
          const validStartTime = startTime > 1000000000 ? startTime : now + (7 + i) * 24 * 60 * 60;
          const validEndTime = endTime > 1000000000 ? endTime : validStartTime + 2 * 60 * 60;
          
          console.log(`Game ${i}:`, {
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            originalStartTime: startTime,
            originalEndTime: endTime,
            validStartTime: validStartTime,
            validEndTime: validEndTime,
            startTimeDate: new Date(validStartTime * 1000).toLocaleString(),
            endTimeDate: new Date(validEndTime * 1000).toLocaleString()
          });
          
          games.push({
            id: i,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            startTime: validStartTime,
            endTime: validEndTime,
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
      const now = Math.floor(Date.now() / 1000);
      const oneDay = 24 * 60 * 60;
      const gameDuration = 2 * 60 * 60;
      
      return [
        {
          id: 0,
          homeTeam: "Manchester United",
          awayTeam: "Liverpool",
          startTime: now + (7 * oneDay),
          endTime: now + (7 * oneDay) + gameDuration,
          isActive: true,
          isFinished: false
        },
        {
          id: 1,
          homeTeam: "Barcelona",
          awayTeam: "Real Madrid",
          startTime: now + (14 * oneDay),
          endTime: now + (14 * oneDay) + gameDuration,
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

  // Create a new game
  async createGame(
    homeTeam: string,
    awayTeam: string,
    startTime: number,
    endTime: number,
    signer: ethers.Signer
  ): Promise<number> {
    if (!signer) throw new Error('Signer not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      signer
    );
    
    try {
      const tx = await contract.createGame(homeTeam, awayTeam, startTime, endTime);
      const receipt = await tx.wait();
      
      // Extract game ID from events
      const gameCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'GameCreated';
        } catch {
          return false;
        }
      });
      
      if (gameCreatedEvent) {
        const parsed = contract.interface.parseLog(gameCreatedEvent);
        return Number(parsed?.args.gameId);
      }
      
      // Fallback: return the current game count - 1
      const gameCount = await this.getGameCount();
      return gameCount - 1;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }
}

export const fheContractService = new FheContractService();