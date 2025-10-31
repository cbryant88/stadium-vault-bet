// Ethereum injection conflict fix
// Reference: fantasy-vault-trade

console.log('🔧 Loading Ethereum conflict fix...');

(function() {
  // Store original defineProperty
  const originalDefineProperty = Object.defineProperty;
  
  // Override defineProperty to handle ethereum conflicts
  Object.defineProperty = function(obj, prop, descriptor) {
    // Check if trying to redefine window.ethereum
    if (obj === window && prop === 'ethereum') {
      console.warn('⚠️ Attempted to redefine window.ethereum property');
      console.log('📊 Current ethereum provider:', window.ethereum?.isMetaMask ? 'MetaMask' : 'Other');
      console.log('📊 Descriptor configurable:', descriptor?.configurable);
      
      // If the property already exists and is not configurable, make it configurable first
      if (window.ethereum && descriptor && !descriptor.configurable) {
        try {
          console.log('🔧 Making existing ethereum property configurable...');
          Object.defineProperty(window, 'ethereum', {
            ...Object.getOwnPropertyDescriptor(window, 'ethereum'),
            configurable: true
          });
        } catch (e) {
          console.warn('⚠️ Could not make ethereum configurable:', e);
          return window.ethereum; // Return existing property
        }
      }
      
      // Make the new descriptor configurable
      if (descriptor && !descriptor.configurable) {
        descriptor.configurable = true;
      }
    }
    
    // For other properties, use original behavior
    return originalDefineProperty.call(this, obj, descriptor);
  };
  
  // Check for multiple ethereum providers
  if (window.ethereum) {
    console.log('📊 Ethereum provider detected:', {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      providers: window.ethereum.providers?.length || 1
    });
    
    // Handle multiple providers
    if (window.ethereum.providers && window.ethereum.providers.length > 1) {
      console.warn('⚠️ Multiple Ethereum providers detected');
      console.log('📊 Providers count:', window.ethereum.providers.length);
    }
  }
  
  console.log('✅ Ethereum conflict fix loaded successfully');
})();

// Export for potential use in other modules
export const ethereumFix = {
  isLoaded: true,
  timestamp: Date.now()
};

