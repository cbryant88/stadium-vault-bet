import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fheContractService, FHEGame, FHEBet } from '@/lib/fheContractService';

export interface BettingState {
  games: FHEGame[];
  userBets: FHEBet[];
  loading: boolean;
  error: string | null;
}

export const useBetting = () => {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<BettingState>({
    games: [],
    userBets: [],
    loading: false,
    error: null
  });

  // Load games
  const loadGames = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const games = await fheContractService.getGames();
      setState(prev => ({ ...prev, games, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load games' 
      }));
    }
  }, []);

  // Load user bets
  const loadUserBets = useCallback(async () => {
    if (!address || !isConnected) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userBets = await fheContractService.getUserBets(address);
      setState(prev => ({ ...prev, userBets, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user bets' 
      }));
    }
  }, [address, isConnected]);

  // Place a bet
  const placeBet = useCallback(async (
    gameId: string,
    teamSelection: 'home' | 'away' | 'draw',
    amount: number
  ) => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fheContractService.placeBet(gameId, teamSelection, amount, address);
      if (result.success) {
        setState(prev => ({ ...prev, loading: false }));
        // Reload data after successful bet placement
        setTimeout(() => {
          loadGames();
          if (address && isConnected) {
            loadUserBets();
          }
        }, 100);
        return result;
      } else {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Failed to place bet' 
        }));
        throw new Error(result.error || 'Failed to place bet');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to place bet' 
      }));
      throw error;
    }
  }, [address, isConnected, loadGames, loadUserBets]);

  // Get betting pool for a game
  const getBettingPool = useCallback(async (gameId: string) => {
    try {
      return await fheContractService.getBettingPool(gameId);
    } catch (error) {
      console.error('Failed to get betting pool:', error);
      return null;
    }
  }, []);

  // Load data on mount and when wallet connects
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    if (isConnected && address) {
      loadUserBets();
    } else {
      setState(prev => ({ ...prev, userBets: [] }));
    }
  }, [isConnected, address, loadUserBets]);

  return {
    ...state,
    placeBet,
    getBettingPool,
    loadGames,
    loadUserBets,
    isConnected
  };
};
