import { Header } from "@/components/Header";
import { WalletConnect } from "@/components/WalletConnect";
import { Scoreboard } from "@/components/Scoreboard";
import { BettingSlip } from "@/components/BettingSlip";
import { UserBets } from "@/components/UserBets";
import { TestBettingFlow } from "@/components/TestBettingFlow";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-stadium">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet, Betting Slip & User Bets */}
          <div className="space-y-6">
            <WalletConnect />
            <BettingSlip />
            <UserBets />
            <TestBettingFlow />
          </div>

          {/* Right Column - Scoreboard */}
          <div className="lg:col-span-2">
            <Scoreboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
