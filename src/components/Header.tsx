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
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="12" fill="url(#stadiumGradient)"/>
                <ellipse cx="32" cy="40" rx="24" ry="12" fill="url(#fieldGradient)" opacity="0.3"/>
                <path d="M8 20 L8 44 L56 44 L56 20 L48 16 L16 16 Z" fill="url(#structureGradient)" opacity="0.4"/>
                <circle cx="16" cy="12" r="2" fill="#FFD700"/>
                <circle cx="32" cy="10" r="2" fill="#FFD700"/>
                <circle cx="48" cy="12" r="2" fill="#FFD700"/>
                <circle cx="20" cy="28" r="4" fill="url(#chipGradient1)"/>
                <circle cx="44" cy="28" r="4" fill="url(#chipGradient2)"/>
                <circle cx="32" cy="32" r="4" fill="url(#chipGradient3)"/>
                <path d="M32 8 L36 12 L36 20 L32 24 L28 20 L28 12 Z" fill="url(#shieldGradient)"/>
                <rect x="30" y="14" width="4" height="3" rx="1" fill="#4A90E2"/>
                <path d="M30 14 L30 12 Q30 10 32 10 Q34 10 34 12 L34 14" stroke="#4A90E2" stroke-width="1" fill="none"/>
                <defs>
                  <linearGradient id="stadiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#0f3460;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#16537e;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="structureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#34495e;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="chipGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="chipGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#229954;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="chipGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#e67e22;stop-opacity:1" />
                  </linearGradient>
                  <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#357ABD;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
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