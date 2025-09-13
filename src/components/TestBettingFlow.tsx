import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fheContractService } from '@/lib/fheContractService';

export const TestBettingFlow = () => {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [testAmount, setTestAmount] = useState<number>(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const testPlaceBet = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);
    try {
      const result = await fheContractService.placeBet(
        "1", // Test game ID
        "home", // Test team selection
        testAmount,
        address
      );

      if (result.success) {
        toast({
          title: "Test Bet Placed Successfully!",
          description: `FHE encrypted bet placed with ID: ${result.betId}`,
        });
      } else {
        toast({
          title: "Test Bet Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Bet Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const testGetGames = async () => {
    try {
      const games = await fheContractService.getGames();
      toast({
        title: "Games Loaded",
        description: `Loaded ${games.length} games successfully`,
      });
      console.log('Games:', games);
    } catch (error) {
      toast({
        title: "Failed to Load Games",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Test Betting Flow</h3>
        <p className="text-muted-foreground">Connect your wallet to test the betting flow</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Test Betting Flow</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="testAmount">Test Bet Amount</Label>
          <Input
            id="testAmount"
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(Number(e.target.value))}
            min="1"
            max="1000"
            className="mt-1"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testGetGames}
            variant="outline"
            className="flex-1"
          >
            Test Load Games
          </Button>
          
          <Button 
            onClick={testPlaceBet}
            disabled={isPlacingBet}
            className="flex-1"
          >
            {isPlacingBet ? "Placing Bet..." : "Test Place Bet"}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Wallet: {address}</p>
          <p>Status: Connected</p>
        </div>
      </div>
    </Card>
  );
};
