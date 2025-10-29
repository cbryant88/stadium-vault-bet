import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Loader2 } from "lucide-react";
import { useBetting } from "@/hooks/useBetting";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Scoreboard = () => {
  const { games, loading, error } = useBetting();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to add bet to betting slip
  const addBetToSlip = (gameId: string, team: string, opponent: string, odds: number, teamSelection: 'home' | 'away' | 'draw') => {
    console.log('🎯 Scoreboard: Adding bet to slip:', { gameId, team, opponent, odds, teamSelection });
    
    // Create a custom event to communicate with BettingSlip component
    const betEvent = new CustomEvent('addBetToSlip', {
      detail: {
        gameId,
        team,
        opponent,
        odds,
        teamSelection
      }
    });
    
    console.log('📡 Scoreboard: Dispatching addBetToSlip event:', betEvent);
    window.dispatchEvent(betEvent);
    
    toast({
      title: "Bet Added to Slip",
      description: `${team} vs ${opponent} bet added to your betting slip`,
    });
  };

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

      {games.map((game) => {
        // Calculate game status based on time
        const now = Math.floor(Date.now() / 1000);
        let status = 'upcoming';
        let timeRemaining = '';
        
        
        if (now >= game.startTime && now < game.endTime) {
          status = 'live';
          const remaining = game.endTime - now;
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          timeRemaining = `${hours}h ${minutes}m`;
        } else if (now >= game.endTime) {
          status = 'finished';
        } else {
          const untilStart = game.startTime - now;
          const hours = Math.floor(untilStart / 3600);
          const minutes = Math.floor((untilStart % 3600) / 60);
          timeRemaining = `Starts in ${hours}h ${minutes}m`;
        }

        return (
        <Card key={game.id} className="bg-gradient-scoreboard border-stadium-glow/20 p-4 shadow-scoreboard animate-scoreboard-flicker">
          <div className="space-y-3">
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                    variant={status === "live" ? "default" : "secondary"}
                    className={status === "live" ? "bg-stadium-live text-background animate-live-pulse" : ""}
                >
                    {status === "live" ? "LIVE" : status.toUpperCase()}
                </Badge>
                  {timeRemaining && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                      <span>{timeRemaining}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                  <span>0 bets</span>
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="font-bold text-lg">{game.homeTeam}</div>
                <div className="text-2xl font-mono font-bold text-stadium-glow">
                  {status === 'finished' ? '2' : '-'}
                </div>
                <div className="text-xs text-accent">@1.8</div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">VS</div>
                <div className="text-xs text-accent">Draw @3.2</div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-lg">{game.awayTeam}</div>
                <div className="text-2xl font-mono font-bold text-stadium-glow">
                  {status === 'finished' ? '1' : '-'}
                </div>
                <div className="text-xs text-accent">@2.0</div>
              </div>
            </div>

            {/* Quick Bet Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <button 
                onClick={() => addBetToSlip(game.id.toString(), game.homeTeam, game.awayTeam, 1.8, 'home')}
                className="bg-stadium-glow/10 hover:bg-stadium-glow/20 border border-stadium-glow/30 rounded-md py-2 px-3 text-sm font-medium transition-colors"
                disabled={status === 'finished'}
              >
                Bet {game.homeTeam}
              </button>
              <button 
                onClick={() => addBetToSlip(game.id.toString(), game.awayTeam, game.homeTeam, 2.0, 'away')}
                className="bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-md py-2 px-3 text-sm font-medium transition-colors"
                disabled={status === 'finished'}
              >
                Bet {game.awayTeam}
              </button>
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
};