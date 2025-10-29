import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initZama = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        console.log(`🚀 Starting FHE initialization process... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        setIsLoading(true);
        setError(null);

        // 检查CDN脚本是否加载
        if (typeof window !== 'undefined' && !window.relayerSDK) {
          console.warn('⚠️ FHE SDK CDN script not loaded, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (!window.relayerSDK) {
            console.warn('⚠️ CDN script failed, trying to load from npm package...');
            // 如果CDN失败，尝试从npm包加载
            try {
              const { initSDK: npmInitSDK, createInstance: npmCreateInstance } = await import('@zama-fhe/relayer-sdk/bundle');
              window.relayerSDK = { initSDK: npmInitSDK, createInstance: npmCreateInstance };
              console.log('✅ Successfully loaded FHE SDK from npm package');
            } catch (npmError) {
              console.error('❌ Failed to load FHE SDK from both CDN and npm:', npmError);
              throw new Error('FHE SDK not available. Please check network connection and try again.');
            }
          }
        }

        console.log('🔄 Step 1: Initializing FHE SDK...');
        console.log('📊 SDK available:', !!window.relayerSDK);
        console.log('📊 initSDK function:', typeof window.relayerSDK?.initSDK);
        
        // 添加延迟以确保WASM完全加载
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await initSDK();
        console.log('✅ Step 1 completed: FHE SDK initialized successfully');

        console.log('🔄 Step 2: Creating FHE instance with Sepolia config...');
        console.log('📊 SepoliaConfig:', SepoliaConfig);
        
        // 再次添加延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const zamaInstance = await createInstance(SepoliaConfig);
        console.log('✅ Step 2 completed: FHE instance created successfully');
        console.log('📊 Instance methods:', Object.keys(zamaInstance || {}));

        if (mounted) {
          setInstance(zamaInstance);
          console.log('🎉 FHE initialization completed successfully!');
          console.log('📊 Instance ready for encryption/decryption operations');
        }
      } catch (err) {
        console.error(`❌ FHE initialization failed at step (attempt ${retryCount + 1}):`, err);
        console.error('📊 Error details:', {
          name: err?.name,
          message: err?.message,
          stack: err?.stack
        });
        
        // 如果是WASM相关错误且还有重试次数，则重试
        if (retryCount < maxRetries && (
          err?.message?.includes('unwrap_throw') || 
          err?.message?.includes('WASM') ||
          err?.message?.includes('Result::unwrap_throw')
        )) {
          console.log(`🔄 Retrying FHE initialization in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            if (mounted) {
              initZama(retryCount + 1);
            }
          }, 3000);
          return;
        }
        
        if (mounted) {
          // 设置一个占位符实例，允许应用继续运行
          setInstance({
            createEncryptedInput: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            generateKeypair: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            createEIP712: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            publicDecrypt: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            userDecrypt: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            getPublicKey: () => {
              throw new Error('FHE not available - encryption disabled');
            },
            getPublicParams: () => {
              throw new Error('FHE not available - encryption disabled');
            }
          });
          setError(`Encryption service unavailable: ${err instanceof Error ? err.message : 'Unknown error'}. App will run in limited mode.`);
          console.warn('⚠️ FHE initialization failed, running in limited mode without encryption');
        }
      } finally {
        if (mounted && !isLoading) {
          setIsLoading(false);
        }
      }
    };

    initZama();

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error };
}