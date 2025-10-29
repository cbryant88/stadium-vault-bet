import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { fheContractService } from '@/lib/fheContractService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, Users } from 'lucide-react';

export const CreateGame: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { signerPromise } = useEthersSigner();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    startDays: 1, // Days from now
    duration: 2 // Hours
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateGame = async () => {
    if (!isConnected || !address || !signerPromise) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create games.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.homeTeam.trim() || !formData.awayTeam.trim()) {
      toast({
        title: "Missing team names",
        description: "Please enter both home and away team names.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');

      // Calculate start and end times
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + (formData.startDays * 24 * 60 * 60); // Convert days to seconds
      const endTime = startTime + (formData.duration * 60 * 60); // Convert hours to seconds

      const gameId = await fheContractService.createGame(
        formData.homeTeam.trim(),
        formData.awayTeam.trim(),
        startTime,
        endTime,
        signer
      );

      toast({
        title: "Game Created Successfully!",
        description: `${formData.homeTeam} vs ${formData.awayTeam} has been created with ID ${gameId}`,
      });

      // Reset form
      setFormData({
        homeTeam: '',
        awayTeam: '',
        startDays: 1,
        duration: 2
      });

      // Trigger a page refresh to show the new game
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error creating game",
        description: error instanceof Error ? error.message : "Failed to create game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDateTime = (daysFromNow: number, duration: number) => {
    const startTime = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    return {
      start: startTime.toLocaleString(),
      end: endTime.toLocaleString()
    };
  };

  const { start, end } = formatDateTime(formData.startDays, formData.duration);

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="bg-gradient-scoreboard border-stadium-glow/20 shadow-scoreboard">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5 text-blue-500" />
          Create New Game
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Quickly create a new game for testing betting functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homeTeam" className="text-sm font-medium">Home Team</Label>
            <Input
              id="homeTeam"
              value={formData.homeTeam}
              onChange={(e) => handleInputChange('homeTeam', e.target.value)}
              placeholder="e.g., Manchester United"
              className="bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayTeam" className="text-sm font-medium">Away Team</Label>
            <Input
              id="awayTeam"
              value={formData.awayTeam}
              onChange={(e) => handleInputChange('awayTeam', e.target.value)}
              placeholder="e.g., Liverpool"
              className="bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDays" className="text-sm font-medium">Start In (Days)</Label>
            <Input
              id="startDays"
              type="number"
              value={formData.startDays}
              onChange={(e) => handleInputChange('startDays', parseInt(e.target.value) || 1)}
              min="1"
              max="30"
              className="bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">Duration (Hours)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 2)}
              min="1"
              max="6"
              className="bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="bg-background/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Game Schedule:</span>
          </div>
          <div className="text-sm text-muted-foreground ml-6">
            <div>Start: {start}</div>
            <div>End: {end}</div>
          </div>
        </div>

        <Button
          onClick={handleCreateGame}
          disabled={isCreating || !formData.homeTeam.trim() || !formData.awayTeam.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isCreating ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Creating Game...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
