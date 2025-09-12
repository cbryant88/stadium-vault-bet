import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card } from "@/components/ui/card";
import { Wallet, Shield, Zap } from "lucide-react";

export const WalletConnect = () => {
  return (
    <Card className="bg-gradient-scoreboard border-stadium-glow/30 p-6 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-stadium-glow/10 rounded-full flex items-center justify-center mx-auto">
          <Wallet className="w-8 h-8 text-stadium-glow" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Securely connect your wallet to place encrypted bets
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>FHE Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Private Bets</span>
          </div>
        </div>
        <div className="flex justify-center">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="w-full bg-stadium-glow hover:bg-stadium-glow/90 text-background font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stadium-glow/20 rounded-full flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-stadium-glow" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Connected Wallet</p>
                          <p className="font-mono text-sm text-foreground">
                            {account.displayName}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-stadium-live rounded-full animate-live-pulse"></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </Card>
  );
};