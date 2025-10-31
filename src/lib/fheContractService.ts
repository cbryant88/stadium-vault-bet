import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

// FHE Handle 转换工具 (参考 fantasy-vault-trade)
export const convertHex = (handle: any): string => {
  let hex = '';
  if (handle instanceof Uint8Array) {
    hex = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
  } else if (typeof handle === 'string') {
    hex = handle.startsWith('0x') ? handle : `0x${handle}`;
  } else if (typeof handle === 'number') {
    hex = `0x${handle.toString(16)}`;
  } else if (handle && typeof handle.toString === 'function') {
    const str = handle.toString(16);
    hex = str.startsWith('0x') ? str : `0x${str}`;
  } else {
    console.warn('Unknown handle type:', typeof handle, handle);
    hex = `0x${JSON.stringify(handle)}`;
  }
  return hex;
};

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
  private browserProvider: ethers.BrowserProvider | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;

  constructor() {
    // 同步初始化 provider（不需要钱包的读取 provider）
    this.initializeProviderSync();
  }

  private initializeProviderSync() {
    // 同步初始化读取用的 provider
    if (!this.provider) {
      try {
        const rpcUrl = (import.meta as any)?.env?.VITE_RPC_URL || 'https://1rpc.io/sepolia';
        this.provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize provider:', error);
      }
    }
  }

  private async initializeProvider() {
    if (this.initializationPromise) return this.initializationPromise;
    
    this.initializationPromise = (async () => {
      // 如果已经初始化了同步 provider，确保它存在
      if (!this.provider) {
        this.initializeProviderSync();
      }

      // 写使用浏览器钱包
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        if (!this.browserProvider) {
          this.browserProvider = new ethers.BrowserProvider((window as any).ethereum);
        }
        try {
          if (!this.signer) {
            this.signer = await this.browserProvider.getSigner();
          }
        } catch (_) {
          // Signer 可能不可用（钱包未连接），这是正常的
        }
      }
    })();
    
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  private async ensureInitialized() {
    // 确保读取 provider 已初始化
    if (!this.provider) {
      this.initializeProviderSync();
    }
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    // 如果需要 signer，尝试初始化
    if (typeof window !== 'undefined' && !this.browserProvider && (window as any).ethereum) {
      await this.initializeProvider();
    }
  }

  private async ensureSignerReady() {
    await this.ensureInitialized();
    if (!this.browserProvider && typeof window !== 'undefined' && (window as any).ethereum) {
      this.browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    }
    if (typeof window !== 'undefined' && (window as any).ethereum?.request) {
      try { await (window as any).ethereum.request({ method: 'eth_requestAccounts' }); } catch (_) {}

      // 检查当前链并确保为 Sepolia，否则切换/添加
      try {
        const net = await (this.browserProvider ?? this.provider)!.getNetwork();
        const sepoliaHex = '0xaa36a7'; // 11155111
        if (!net || net.chainId !== 11155111n) {
          try {
            await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: sepoliaHex }] });
          } catch (err: any) {
            // 4902: 未添加该链，尝试添加后再切换
            if (err && (err.code === 4902 || err.message?.includes('Unrecognized chain ID'))) {
              const rpcUrl = (import.meta as any)?.env?.VITE_RPC_URL || 'https://1rpc.io/sepolia';
              try {
                await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: sepoliaHex,
                    chainName: 'Sepolia',
                    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                    rpcUrls: [rpcUrl],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }]
                });
                await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: sepoliaHex }] });
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
    }
    if (this.browserProvider && !this.signer) {
      try { this.signer = await this.browserProvider.getSigner(); } catch (_) {}
    }
    if (!this.signer) throw new Error('Signer not initialized');
  }

  async getUSDCBalance(userAddress: string): Promise<string> {
    await this.ensureInitialized();
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
    await this.ensureInitialized();
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
    await this.ensureSignerReady();
    
    const usdcContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TestUSDC,
      CONTRACT_ABIS.TestUSDC,
      this.signer
    );
    
    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await usdcContract.faucet(await this.signer.getAddress(), amountWei);
    await tx.wait();
  }

  async approveUSDC(spender: string, amount: string | number): Promise<void> {
    await this.ensureSignerReady();
    
    const usdcContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TestUSDC,
      CONTRACT_ABIS.TestUSDC,
      this.signer
    );
    
    const amountWei = ethers.parseUnits(String(amount), 6);
    const tx = await usdcContract.approve(spender, amountWei);
    await tx.wait();
    }

  async placeBetWithFHE(
    gameId: number,
    amount: string | number,
    teamSelection: string | number,
    instance: FhevmInstance,
    signerPromise: Promise<any>,
    userAddress: string
  ): Promise<number> {
    try {
      // Convert team selection to number
      let teamSelectionNum: number;
      if (typeof teamSelection === 'string') {
        switch (teamSelection.toLowerCase()) {
          case 'home':
            teamSelectionNum = 0;
            break;
          case 'away':
            teamSelectionNum = 1;
            break;
          case 'draw':
            teamSelectionNum = 2;
            break;
          default:
            throw new Error(`Invalid team selection: ${teamSelection}`);
        }
      } else {
        teamSelectionNum = Number(teamSelection);
        if (isNaN(teamSelectionNum)) {
          throw new Error(`Invalid team selection number: ${teamSelection}`);
        }
      }
      
      // Ensure wallet is authorized and signer ready
      await this.ensureSignerReady();
      const fallbackSigner = await signerPromise;
      const signer = this.signer ?? fallbackSigner;
      if (!signer) throw new Error('Signer not available');
      
      console.log('📊 Signer type:', typeof signer);
      console.log('📊 Signer methods:', Object.getOwnPropertyNames(signer));
      console.log('📊 Signer prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(signer)));
      
      console.log('📊 Using provided user address:', userAddress);
      
      // Create encrypted input with contract address and user address
      console.log('🔄 Creating encrypted input...');
      console.log('📊 Contract address:', CONTRACT_ADDRESSES.StadiumVaultBet);
      console.log('📊 User address:', userAddress);
      
      // Try to create encrypted input with our contract address
      // If this fails, it means the contract is not registered on FHE network
      const input = instance.createEncryptedInput(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        userAddress
      );
      console.log('✅ Encrypted input created');
      
      // Add amount and team selection to encrypted input
      console.log('🔄 Step 2: Adding encrypted data...');
      
      // 验证所有值都在32位范围内
      const max32Bit = 4294967295; // 2^32 - 1
      
      const amountStr = String(amount);
      const amountBigInt = BigInt(ethers.parseUnits(amountStr, 6).toString());
      console.log('📊 Adding amount:', amountBigInt.toString());
      
      if (amountBigInt > BigInt(max32Bit)) {
        throw new Error(`Amount ${amountBigInt} exceeds 32-bit limit`);
      }
      input.add32(amountBigInt);
      
      console.log('📊 Adding team selection:', teamSelectionNum);
      if (teamSelectionNum > max32Bit) {
        throw new Error(`Team selection ${teamSelectionNum} exceeds 32-bit limit`);
      }
      input.add8(teamSelectionNum);
      
      console.log('✅ Step 2 completed: All data added to encrypted input');
      
      // Encrypt the input
      console.log('🔄 Step 3: Encrypting data...');
      const encryptedInput = await input.encrypt();
      console.log('✅ Step 3 completed: Data encrypted successfully');
      console.log('📊 Encrypted handles count:', encryptedInput.handles.length);
      
      // Convert handles and proof to hex strings
      console.log('🔄 Step 4: Converting handles to hex format...');
      const handles = encryptedInput.handles.map((handle, index) => {
        const hex = convertHex(handle);
        console.log(`📊 Handle ${index}: ${hex.substring(0, 10)}... (${hex.length} chars)`);
        return hex;
      });
      
      const inputProof = `0x${Array.from(encryptedInput.inputProof)
        .map((b: number) => b.toString(16).padStart(2, '0')).join('')}`;
      console.log('📊 Proof length:', inputProof.length);
      
      console.log('🎉 Encryption completed successfully!');
      console.log('📊 Final result:', {
        handlesCount: handles.length,
        proofLength: inputProof.length,
        handles: handles.map(h => h.substring(0, 10) + '...')
      });
      
      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        CONTRACT_ABIS.StadiumVaultBet,
        signer
      );
      
      // Note: No need to approve USDC transfer as we're using vault balance
      // The contract will deduct from user's vault balance directly
      
      // Place bet with encrypted data
      console.log('🔄 Placing bet on contract...');
      console.log('📊 Contract parameters:', {
        gameId,
        amountHandle: handles[0],
        teamSelectionHandle: handles[1],
        proofLength: inputProof.length
      });
      
      // Create handles array for contract call
      const handlesArray = [handles[0], handles[1]]; // Only 2 handles for our use case
      
      const tx = await contract.placeBet(
        gameId,
        handlesArray, // handles array (bytes32[])
        inputProof, // input proof (bytes)
        amountBigInt // usdcAmount (uint256) - amount to deduct from vault
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
    await this.ensureInitialized();
    if (!this.provider) throw new Error('Provider not initialized');
    
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.StadiumVaultBet,
        CONTRACT_ABIS.StadiumVaultBet,
        this.provider
      );
      
      const count = await contract.getGameCount();
      console.log('Raw game count from contract:', count);
      return Number(count);
    } catch (error) {
      console.error('Error getting game count:', error);
      // Return 0 if there's an error, which will trigger mock games
      return 0;
    }
  }

  async getBetCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    return Number(await contract.getBetCount());
  }

  // Vault Functions
  async depositToVault(amount: string | number): Promise<void> {
    await this.ensureSignerReady();
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.signer
    );
    
    // First approve USDC transfer
    await this.approveUSDC(CONTRACT_ADDRESSES.StadiumVaultBet, amount);
    
    // Deposit to vault
    const amountWei = ethers.parseUnits(String(amount), 6);
    const tx = await contract.depositToVault(amountWei);
    await tx.wait();
  }

  async withdrawFromVault(amount: string | number): Promise<void> {
    await this.ensureSignerReady();
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.signer
    );
    
    const amountWei = ethers.parseUnits(String(amount), 6);
    const tx = await contract.withdrawFromVault(amountWei);
    await tx.wait();
  }

  async getVaultBalance(userAddress: string): Promise<string> {
    await this.ensureInitialized();
    if (!this.provider) throw new Error('Provider not initialized');
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.StadiumVaultBet,
      CONTRACT_ABIS.StadiumVaultBet,
      this.provider
    );
    
    const balance = await contract.getVaultBalance(userAddress);
    return ethers.formatUnits(balance, 6);
  }

  // Get all games from contract
  async getGames(): Promise<FHEGame[]> {
    await this.ensureInitialized();
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