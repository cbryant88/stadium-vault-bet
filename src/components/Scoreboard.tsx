import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Loader2 } from "lucide-react";
import { useBetting } from "@/hooks/useBetting";
import { useState } from "react";

export const Scoreboard = () => {
  const { games, loading, error } = useBetting();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-stadium-live/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-stadium-live" />
          </div>
          <h2 className="text-xl font-bold">Live Sports</h2>
          <div className="w-2 h-2 bg-stadium-live rounded-full animate-live-pulse ml-2"></div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-stadium-glow" />
          <span className="ml-2 text-muted-foreground">Loading games...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-stadium-live/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-stadium-live" />
          </div>
          <h2 className="text-xl font-bold">Live Sports</h2>
          <div className="w-2 h-2 bg-stadium-live rounded-full animate-live-pulse ml-2"></div>
        </div>
        <Card className="bg-gradient-scoreboard border-red-500/30 p-6 text-center">
          <p className="text-red-400">Error loading games: {error}</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-stadium-live/20 rounded-full flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-stadium-live" />
        </div>
        <h2 className="text-xl font-bold">Live Sports</h2>
        <div className="w-2 h-2 bg-stadium-live rounded-full animate-live-pulse ml-2"></div>
      </div>

      {games.map((game) => (
        <Card key={game.id} className="bg-gradient-scoreboard border-stadium-glow/20 p-4 shadow-scoreboard animate-scoreboard-flicker">
          <div className="space-y-3">
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={game.status === "live" ? "default" : "secondary"}
                  className={game.status === "live" ? "bg-stadium-live text-background animate-live-pulse" : ""}
                >
                  {game.status === "live" ? "LIVE" : game.status.toUpperCase()}
                </Badge>
                {game.timeRemaining && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{game.timeRemaining}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{game.totalBets.toLocaleString()} bets</span>
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="font-bold text-lg">{game.homeTeam}</div>
                <div className="text-2xl font-mono font-bold text-stadium-glow">
                  {game.homeScore}
                </div>
                <div className="text-xs text-accent">@{game.odds.home}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">VS</div>
                {game.odds.draw && (
                  <div className="text-xs text-accent">Draw @{game.odds.draw}</div>
                )}
              </div>
              
              <div className="text-center">
                <div className="font-bold text-lg">{game.awayTeam}</div>
                <div className="text-2xl font-mono font-bold text-stadium-glow">
                  {game.awayScore}
                </div>
                <div className="text-xs text-accent">@{game.odds.away}</div>
              </div>
            </div>

            {/* Quick Bet Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <button 
                onClick={() => {
                  // This would trigger adding to betting slip
                  console.log(`Add ${game.homeTeam} bet to slip`);
                }}
                className="bg-stadium-glow/10 hover:bg-stadium-glow/20 border border-stadium-glow/30 rounded-md py-2 px-3 text-sm font-medium transition-colors"
              >
                Bet {game.homeTeam}
              </button>
              <button 
                onClick={() => {
                  // This would trigger adding to betting slip
                  console.log(`Add ${game.awayTeam} bet to slip`);
                }}
                className="bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-md py-2 px-3 text-sm font-medium transition-colors"
              >
                Bet {game.awayTeam}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};