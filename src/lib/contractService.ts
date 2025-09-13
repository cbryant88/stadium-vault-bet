// Mock contract service for Stadium Vault Bet
// This simulates the FHE encrypted betting contract functionality

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'upcoming' | 'finished';
  timeRemaining?: string;
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
  totalBets: number;
  startTime: number;
  endTime: number;
}

export interface Bet {
  id: string;
  gameId: string;
  team: string;
  opponent: string;
  odds: number;
  amount: number;
  teamSelection: 'home' | 'away' | 'draw';
  isActive: boolean;
  isSettled: boolean;
  timestamp: number;
}

export interface BettingPool {
  gameId: string;
  totalBets: number;
  totalAmount: number;
  homeBets: number;
  awayBets: number;
  drawBets: number;
}

class ContractService {
  private games: Game[] = [
    {
      id: "1",
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      homeScore: 95,
      awayScore: 88,
      status: "live",
      timeRemaining: "4:32 Q3",
      odds: { home: 1.85, away: 2.10 },
      totalBets: 1247,
      startTime: Date.now() - 3600000,
      endTime: Date.now() + 1800000
    },
    {
      id: "2",
      homeTeam: "Cowboys",
      awayTeam: "Giants",
      homeScore: 21,
      awayScore: 14,
      status: "live",
      timeRemaining: "12:45 Q2",
      odds: { home: 1.65, away: 2.45 },
      totalBets: 2856,
      startTime: Date.now() - 1800000,
      endTime: Date.now() + 3600000
    },
    {
      id: "3",
      homeTeam: "City",
      awayTeam: "United",
      homeScore: 0,
      awayScore: 0,
      status: "upcoming",
      timeRemaining: "19:30 Today",
      odds: { home: 2.20, away: 1.75, draw: 3.40 },
      totalBets: 892,
      startTime: Date.now() + 3600000,
      endTime: Date.now() + 7200000
    }
  ];

  private bets: Bet[] = [];
  private bettingPools: Map<string, BettingPool> = new Map();

  constructor() {
    // Initialize betting pools
    this.games.forEach(game => {
      this.bettingPools.set(game.id, {
        gameId: game.id,
        totalBets: game.totalBets,
        totalAmount: game.totalBets * 50, // Mock total amount
        homeBets: Math.floor(game.totalBets * 0.4),
        awayBets: Math.floor(game.totalBets * 0.5),
        drawBets: Math.floor(game.totalBets * 0.1)
      });
    });
  }

  // Get all games
  async getGames(): Promise<Game[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.games]);
      }, 500);
    });
  }

  // Get game by ID
  async getGame(gameId: string): Promise<Game | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const game = this.games.find(g => g.id === gameId);
        resolve(game || null);
      }, 300);
    });
  }

  // Place a bet
  async placeBet(
    gameId: string,
    teamSelection: 'home' | 'away' | 'draw',
    amount: number,
    userAddress: string
  ): Promise<{ success: boolean; betId?: string; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
          resolve({ success: false, error: 'Game not found' });
          return;
        }

        if (game.status !== 'live' && game.status !== 'upcoming') {
          resolve({ success: false, error: 'Game is not available for betting' });
          return;
        }

        if (amount <= 0 || amount > 10000) {
          resolve({ success: false, error: 'Invalid bet amount' });
          return;
        }

        // Create new bet
        const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const odds = teamSelection === 'home' ? game.odds.home : 
                    teamSelection === 'away' ? game.odds.away : 
                    game.odds.draw || 1;

        const newBet: Bet = {
          id: betId,
          gameId,
          team: teamSelection === 'home' ? game.homeTeam : game.awayTeam,
          opponent: teamSelection === 'home' ? game.awayTeam : game.homeTeam,
          odds,
          amount,
          teamSelection,
          isActive: true,
          isSettled: false,
          timestamp: Date.now()
        };

        this.bets.push(newBet);

        // Update betting pool
        const pool = this.bettingPools.get(gameId);
        if (pool) {
          pool.totalBets += 1;
          pool.totalAmount += amount;
          if (teamSelection === 'home') pool.homeBets += 1;
          else if (teamSelection === 'away') pool.awayBets += 1;
          else pool.drawBets += 1;
        }

        resolve({ success: true, betId });
      }, 1000);
    });
  }

  // Get user's bets
  async getUserBets(userAddress: string): Promise<Bet[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would filter by user address
        resolve([...this.bets]);
      }, 300);
    });
  }

  // Get betting pool for a game
  async getBettingPool(gameId: string): Promise<BettingPool | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pool = this.bettingPools.get(gameId);
        resolve(pool || null);
      }, 200);
    });
  }

  // Simulate game result
  async settleGame(gameId: string, homeScore: number, awayScore: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
          resolve(false);
          return;
        }

        game.homeScore = homeScore;
        game.awayScore = awayScore;
        game.status = 'finished';

        // Settle all bets for this game
        this.bets.forEach(bet => {
          if (bet.gameId === gameId && bet.isActive) {
            bet.isActive = false;
            bet.isSettled = true;
          }
        });

        resolve(true);
      }, 500);
    });
  }

  // Get bet result
  async getBetResult(betId: string): Promise<{ isWinner: boolean; payout: number } | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bet = this.bets.find(b => b.id === betId);
        if (!bet || !bet.isSettled) {
          resolve(null);
          return;
        }

        const game = this.games.find(g => g.id === bet.gameId);
        if (!game) {
          resolve(null);
          return;
        }

        let isWinner = false;
        if (bet.teamSelection === 'home' && game.homeScore > game.awayScore) {
          isWinner = true;
        } else if (bet.teamSelection === 'away' && game.awayScore > game.homeScore) {
          isWinner = true;
        } else if (bet.teamSelection === 'draw' && game.homeScore === game.awayScore) {
          isWinner = true;
        }

        const payout = isWinner ? bet.amount * bet.odds : 0;

        resolve({ isWinner, payout });
      }, 300);
    });
  }

  // Update game odds (simulate dynamic odds)
  async updateOdds(gameId: string, newOdds: { home: number; away: number; draw?: number }): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
          resolve(false);
          return;
        }

        game.odds = newOdds;
        resolve(true);
      }, 200);
    });
  }
}

export const contractService = new ContractService();
