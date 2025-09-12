import { useState } from "react";
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Lock, Shield, Calculator, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface Bet {
  id: string;
  team: string;
  opponent: string;
  odds: number;
  amount: number;
}

export const BettingSlip = () => {
  const { isConnected } = useAccount();
  const [bets, setBets] = useState<Bet[]>([
    {
      id: "1",
      team: "Lakers",
      opponent: "vs Warriors",
      odds: 1.85,
      amount: 50
    }
  ]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPlacingBets, setIsPlacingBets] = useState(false);
  const { toast } = useToast();

  const totalStake = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayout = bets.reduce((sum, bet) => sum + (bet.amount * bet.odds), 0);

  const removeBet = (id: string) => {
    setBets(bets.filter(bet => bet.id !== id));
  };

  const updateBetAmount = (id: string, amount: number) => {
    setBets(bets.map(bet => 
      bet.id === id ? { ...bet, amount } : bet
    ));
  };

  const validateBets = () => {
    const invalidBets = bets.filter(bet => bet.amount <= 0 || bet.amount > 10000);
    if (invalidBets.length > 0) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amounts must be between $1 and $10,000",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePlaceBetsClick = () => {
    if (!validateBets()) return;
    setIsConfirmDialogOpen(true);
  };

  const confirmPlaceBets = async () => {
    setIsPlacingBets(true);
    setIsConfirmDialogOpen(false);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful bet placement
      toast({
        title: "Bets Placed Successfully!",
        description: `${bets.length} encrypted bet${bets.length > 1 ? 's' : ''} submitted to the blockchain`,
      });
      
      // Clear betting slip after successful placement
      setBets([]);
      
    } catch (error) {
      toast({
        title: "Bet Placement Failed",
        description: "Please try again or contact support if the issue persists",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBets(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-scoreboard border-stadium-glow/30 p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Wallet to Bet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to start placing encrypted bets
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
          <Shield className="w-5 h-5 text-stadium-glow" />
          <h3 className="font-semibold">Encrypted Betting Slip</h3>
          <Badge variant="secondary" className="bg-stadium-glow/10 text-stadium-glow text-xs">
            FHE Protected
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {bets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No bets selected</p>
          </div>
        ) : (
          <>
            {bets.map((bet) => (
              <div key={bet.id} className="bg-background/50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{bet.team}</div>
                    <div className="text-xs text-muted-foreground">{bet.opponent}</div>
                    <div className="text-xs text-accent">@{bet.odds}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBet(bet.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`bet-${bet.id}`} className="text-xs">Stake Amount</Label>
                  <Input
                    id={`bet-${bet.id}`}
                    type="number"
                    value={bet.amount}
                    onChange={(e) => updateBetAmount(bet.id, Number(e.target.value))}
                    className="h-8 text-sm"
                    min="1"
                    max="10000"
                    placeholder="Enter stake amount"
                  />
                  <div className="text-xs text-muted-foreground">
                    Potential return: ${(bet.amount * bet.odds).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-border/50 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stake:</span>
                <span className="font-mono">${totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-mono text-stadium-glow">${totalPayout.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Profit:</span>
                <span className="font-mono text-stadium-win">${(totalPayout - totalStake).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              variant="stadium" 
              className="w-full" 
              onClick={handlePlaceBetsClick}
              disabled={bets.length === 0 || isPlacingBets}
            >
              {isPlacingBets ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Bets...
                </>
              ) : (
                "Place Encrypted Bets"
              )}
            </Button>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-gradient-scoreboard border-stadium-glow/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-stadium-glow" />
              Confirm Encrypted Bets
            </DialogTitle>
            <DialogDescription>
              Review your bets before submitting them to the blockchain. Once placed, bets cannot be modified or cancelled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-background/30 rounded-lg p-4 space-y-3">
              {bets.map((bet) => (
                <div key={bet.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{bet.team}</span>
                    <span className="text-muted-foreground ml-1">{bet.opponent}</span>
                    <span className="text-accent ml-2">@{bet.odds}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${bet.amount}</div>
                    <div className="text-xs text-muted-foreground">
                      Win: ${(bet.amount * bet.odds).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/30 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stake:</span>
                <span className="font-mono">${totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-mono text-stadium-glow">${totalPayout.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Potential Profit:</span>
                <span className="font-mono text-stadium-win">${(totalPayout - totalStake).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button 
              variant="stadium" 
              onClick={confirmPlaceBets}
              disabled={isPlacingBets}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm & Place Bets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};