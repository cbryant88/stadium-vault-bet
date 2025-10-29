import { Header } from "@/components/Header";
import { WalletConnect } from "@/components/WalletConnect";
import { Scoreboard } from "@/components/Scoreboard";
import { BettingSlip } from "@/components/BettingSlip";
import { UserBets } from "@/components/UserBets";
import { TestBettingFlow } from "@/components/TestBettingFlow";
import { GamesList } from "@/components/GamesList";
import { CreateGame } from "@/components/CreateGame";
import { useBetting } from "@/hooks/useBetting";

const Index = () => {
  const { games, loading, error } = useBetting();

  return (
    <div className="min-h-screen bg-gradient-stadium">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet, Create Game, Betting Slip & User Bets */}
          <div className="space-y-6">
            <WalletConnect />
            <CreateGame />
            <BettingSlip />
            <UserBets />
            <TestBettingFlow />
          </div>

          {/* Right Column - Games List and Scoreboard */}
          <div className="lg:col-span-2 space-y-6">
            <GamesList games={games} />
            <Scoreboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
