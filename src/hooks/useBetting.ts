import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useZamaInstance } from './useZamaInstance';
import { useEthersSigner } from './useEthersSigner';
import { fheContractService, FHEGame, FHEBet } from '@/lib/fheContractService';

export interface BettingState {
  games: FHEGame[];
  userBets: FHEBet[];
  loading: boolean;
  error: string | null;
}

export const useBetting = () => {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const { signerPromise } = useEthersSigner();
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

  // Place a bet with FHE encryption
  const placeBet = useCallback(async (
    gameId: string,
    teamSelection: 'home' | 'away' | 'draw',
    amount: number
  ) => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!instance) {
      throw new Error('FHE encryption service not ready');
    }

    if (!signerPromise) {
      throw new Error('Wallet signer not available');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fheContractService.placeBetWithFHE(
        gameId, 
        teamSelection, 
        amount, 
        address, 
        instance, 
        signerPromise
      );
      
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
  }, [address, isConnected, instance, signerPromise, loadGames, loadUserBets]);

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
    isConnected,
            fheReady: !fheLoading && !!instance,
    fheLoading,
    fheError
  };
};
