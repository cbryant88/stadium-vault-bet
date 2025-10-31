// Ethereum injection conflict fix
// Reference: fantasy-vault-trade

console.log('🔧 Loading Ethereum conflict fix...');

(function() {
  // Store original defineProperty
  const originalDefineProperty = Object.defineProperty;
  
  // Override defineProperty to handle ethereum conflicts
  Object.defineProperty = function(obj, prop, descriptor) {
    // Validate descriptor is an object (not undefined or null)
    if (!descriptor || typeof descriptor !== 'object') {
      // If descriptor is invalid, just use original behavior
      return originalDefineProperty.call(this, obj, prop, descriptor);
    }
    
    // Check if trying to redefine window.ethereum
    if (obj === window && prop === 'ethereum') {
      console.warn('⚠️ Attempted to redefine window.ethereum property');
      console.log('📊 Current ethereum provider:', window.ethereum?.isMetaMask ? 'MetaMask' : 'Other');
      console.log('📊 Descriptor configurable:', descriptor.configurable);
      
      // If the property already exists and is not configurable, make it configurable first
      if (window.ethereum && !descriptor.configurable) {
        try {
          const existingDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
          if (existingDescriptor && !existingDescriptor.configurable) {
            console.log('🔧 Making existing ethereum property configurable...');
            try {
              Object.defineProperty(window, 'ethereum', {
                ...existingDescriptor,
                configurable: true
              });
            } catch (e) {
              console.warn('⚠️ Could not make ethereum configurable:', e);
              // Return existing property instead of redefining
              return window.ethereum;
            }
          }
        } catch (e) {
          console.warn('⚠️ Error checking ethereum property:', e);
          // If we can't check, just proceed with caution
        }
      }
      
      // Make the new descriptor configurable if it's not already
      if (!descriptor.configurable) {
        descriptor = { ...descriptor, configurable: true };
      }
    }
    
    // For other properties or after handling ethereum, use original behavior
    return originalDefineProperty.call(this, obj, prop, descriptor);
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

