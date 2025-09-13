import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBetting } from "@/hooks/useBetting";
import { Clock, Trophy, X, Loader2 } from "lucide-react";

export const UserBets = () => {
  const { userBets, loading, isConnected } = useBetting();

  if (!isConnected) {
    return (
      <Card className="bg-gradient-scoreboard border-stadium-glow/30 p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Wallet to View Bets</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to see your betting history
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-scoreboard border-stadium-glow/30 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stadium-glow mr-2" />
          <span className="text-muted-foreground">Loading your bets...</span>
        </div>
      </Card>
    );
  }

  if (userBets.length === 0) {
    return (
      <Card className="bg-gradient-scoreboard border-stadium-glow/30 p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No Bets Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start placing bets to see them here
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-scoreboard border-stadium-glow/20 shadow-scoreboard">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-stadium-glow" />
          <h3 className="font-semibold">Your Bets</h3>
          <Badge variant="secondary" className="bg-stadium-glow/10 text-stadium-glow text-xs">
            {userBets.length} Active
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {userBets.map((bet) => (
          <div key={bet.id} className="bg-background/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{bet.team}</div>
                <div className="text-xs text-muted-foreground">vs {bet.opponent}</div>
                <div className="text-xs text-accent">@{bet.odds}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">${bet.amount}</div>
                <div className="text-xs text-muted-foreground">
                  Win: ${(bet.amount * bet.odds).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={bet.isActive ? "default" : "secondary"}
                  className={bet.isActive ? "bg-stadium-live text-background" : ""}
                >
                  {bet.isActive ? "Active" : bet.isSettled ? "Settled" : "Pending"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(bet.timestamp).toLocaleDateString()}
                </span>
              </div>
              {bet.isSettled && (
                <div className="flex items-center gap-1">
                  {bet.amount * bet.odds > bet.amount ? (
                    <>
                      <Trophy className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">Won</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">Lost</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
