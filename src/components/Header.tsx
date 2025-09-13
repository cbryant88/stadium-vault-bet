import { Shield, Zap, Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="border-b border-border/50 bg-gradient-stadium backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo-simple.svg" alt="Stadium Vault Bet Logo" className="w-12 h-12" />
            </div>
          </div>
          
          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-stadium-glow via-accent to-stadium-glow bg-clip-text text-transparent">
              Stadium Vault Bet
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The world's first fully encrypted sports betting platform. Your bets remain private with cutting-edge FHE technology.
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="bg-stadium-glow/10 text-stadium-glow border-stadium-glow/30">
              <Shield className="w-3 h-3 mr-1" />
              FHE Encrypted
            </Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/30">
              <Eye className="w-3 h-3 mr-1" />
              Anonymous Betting
            </Badge>
            <Badge variant="secondary" className="bg-stadium-live/10 text-stadium-live border-stadium-live/30">
              <Zap className="w-3 h-3 mr-1" />
              Live Odds
            </Badge>
            <Badge variant="secondary" className="bg-muted/20 text-foreground border-border">
              <Lock className="w-3 h-3 mr-1" />
              Zero Knowledge
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};