import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Trophy } from 'lucide-react';
import { FHEGame } from '@/lib/fheContractService';

interface GamesListProps {
  games: FHEGame[];
  onGameSelect?: (game: FHEGame) => void;
}

export const GamesList: React.FC<GamesListProps> = ({ games, onGameSelect }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeStatus = (game: FHEGame) => {
    const now = Math.floor(Date.now() / 1000);
    if (now < game.startTime) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= game.startTime && now < game.endTime) {
      return { status: 'live', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'finished', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (games.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <Trophy className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600">No Games Available</h3>
          <p className="text-gray-500">Check back later for new games to bet on.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Available Games</h2>
      <div className="grid gap-4">
        {games.map((game) => {
          const timeStatus = getTimeStatus(game);
          return (
            <Card key={game.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{game.homeTeam}</div>
                      <div className="text-sm text-gray-500">Home</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{game.awayTeam}</div>
                      <div className="text-sm text-gray-500">Away</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Start: {formatTime(game.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>End: {formatTime(game.endTime)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={timeStatus.color}>
                    {timeStatus.status.toUpperCase()}
                  </Badge>
                  
                  {game.isActive && !game.isFinished && (
                    <Button
                      onClick={() => onGameSelect?.(game)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Place Bet
                    </Button>
                  )}
                  
                  {game.isFinished && (
                    <Badge variant="outline" className="text-gray-600">
                      Game Finished
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
