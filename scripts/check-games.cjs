const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking games data...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Contract address from deployment
  const stadiumAddress = "0xD491d3757c243F44FF3077536F261aaC2B023B9F";
  
  const StadiumVaultBet = await ethers.getContractFactory("StadiumVaultBet");
  const stadiumVault = StadiumVaultBet.attach(stadiumAddress);
  
  const gameCount = await stadiumVault.getGameCount();
  console.log("Game count:", gameCount.toString());
  
  for (let i = 0; i < gameCount; i++) {
    try {
      const gameData = await stadiumVault.games(i);
      const basicInfo = await stadiumVault.getGameBasicInfo(i);
      
      console.log(`\n--- Game ${i} ---`);
      console.log("Home Team:", gameData.homeTeam);
      console.log("Away Team:", gameData.awayTeam);
      console.log("Start Time (raw):", basicInfo.startTime.toString());
      console.log("End Time (raw):", basicInfo.endTime.toString());
      console.log("Start Time (date):", new Date(Number(basicInfo.startTime) * 1000).toLocaleString());
      console.log("End Time (date):", new Date(Number(basicInfo.endTime) * 1000).toLocaleString());
      console.log("Is Active:", basicInfo.isActive);
      console.log("Is Finished:", basicInfo.isFinished);
    } catch (error) {
      console.error(`Error loading game ${i}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Check failed:", error);
  process.exit(1);
});
