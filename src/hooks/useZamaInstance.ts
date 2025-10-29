import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
      }

      console.log('Initializing FHE SDK...');
      await initSDK();

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('Creating FHE instance...');
      const zamaInstance = await createInstance(config);
      setInstance(zamaInstance);
      setIsInitialized(true);
      console.log('FHE instance created successfully');

    } catch (err) {
      console.error('Failed to initialize Zama instance:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize encryption service. Please ensure you have a wallet connected.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Delay initialization to allow wallet to load
    const timer = setTimeout(() => {
      initializeZama();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    instance,
    isLoading,
    error,
    isInitialized,
    initializeZama
  };
}