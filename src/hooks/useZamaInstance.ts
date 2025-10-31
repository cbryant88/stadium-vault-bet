import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

// 全局单例，防止重复初始化
let globalInstance: any = null;
let globalInitializationPromise: Promise<any> | null = null;
let isGlobalInitializing = false;

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(globalInstance);
  const [isLoading, setIsLoading] = useState(!globalInstance && !isGlobalInitializing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // 如果已有全局实例，直接使用
    if (globalInstance) {
      setInstance(globalInstance);
      setIsLoading(false);
      return;
    }

    // 如果正在初始化，等待完成
    if (globalInitializationPromise) {
      globalInitializationPromise.then((inst) => {
        if (mounted) {
          setInstance(inst);
          setIsLoading(false);
        }
      }).catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize FHE');
          setIsLoading(false);
        }
      });
      return;
    }

    // 标记为正在初始化并创建初始化 promise
    if (!isGlobalInitializing && !globalInitializationPromise) {
      isGlobalInitializing = true;
      
      // 创建初始化 promise
      globalInitializationPromise = (async (retryCount = 0) => {
        const maxRetries = 3;
        
        try {
          console.log(`🚀 Starting FHE initialization process... (attempt ${retryCount + 1}/${maxRetries + 1})`);
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

          // 保存全局实例
          globalInstance = zamaInstance;
          isGlobalInitializing = false;
          globalInitializationPromise = null;

          if (mounted) {
            setInstance(zamaInstance);
            setIsLoading(false);
            console.log('🎉 FHE initialization completed successfully!');
            console.log('📊 Instance ready for encryption/decryption operations');
          }

          return zamaInstance;
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
            isGlobalInitializing = false;
            globalInitializationPromise = null;
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 重新创建初始化 promise 进行重试
            const retryPromise = (async (newRetryCount: number) => {
              const maxRetries = 3;
              try {
                console.log(`🚀 Retrying FHE initialization... (attempt ${newRetryCount + 1}/${maxRetries + 1})`);
                
                console.log('🔄 Step 1: Initializing FHE SDK...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await initSDK();
                console.log('✅ Step 1 completed: FHE SDK initialized successfully');

                console.log('🔄 Step 2: Creating FHE instance with Sepolia config...');
                await new Promise(resolve => setTimeout(resolve, 500));
                const zamaInstance = await createInstance(SepoliaConfig);
                console.log('✅ Step 2 completed: FHE instance created successfully');

                globalInstance = zamaInstance;
                isGlobalInitializing = false;
                globalInitializationPromise = null;

                if (mounted) {
                  setInstance(zamaInstance);
                  setIsLoading(false);
                  console.log('🎉 FHE initialization completed successfully!');
                }

                return zamaInstance;
              } catch (retryErr) {
                // 如果还有重试次数，递归重试
                if (newRetryCount < maxRetries && (
                  retryErr?.message?.includes('unwrap_throw') || 
                  retryErr?.message?.includes('WASM') ||
                  retryErr?.message?.includes('Result::unwrap_throw')
                )) {
                  await new Promise(resolve => setTimeout(resolve, 3000));
                  return await retryPromise(newRetryCount + 1);
                }
                throw retryErr;
              }
            })(retryCount + 1);
            
            globalInitializationPromise = retryPromise;
            return await retryPromise;
          }
          
          isGlobalInitializing = false;
          globalInitializationPromise = null;
          
          // 创建一个占位符实例
          const placeholderInstance = {
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
          };
          
          if (mounted) {
            setInstance(placeholderInstance);
            setError(`Encryption service unavailable: ${err instanceof Error ? err.message : 'Unknown error'}. App will run in limited mode.`);
            setIsLoading(false);
            console.warn('⚠️ FHE initialization failed, running in limited mode without encryption');
          }
          
          throw err;
        }
      })(0);

      // 等待初始化完成
      globalInitializationPromise.then((inst) => {
        if (mounted) {
          setInstance(inst);
          setIsLoading(false);
        }
      }).catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize FHE');
          setIsLoading(false);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { instance, isLoading, error };
}