const { ethers, artifacts } = require("hardhat");

async function main() {
  console.log("🚀 Starting initialization script...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy TestUSDC token
  console.log("\n📦 Deploying TestUSDC token...");
  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const usdcToken = await TestUSDC.deploy(deployer.address);
  await usdcToken.waitForDeployment();
  const usdcAddress = await usdcToken.getAddress();
  console.log("✅ TestUSDC deployed at:", usdcAddress);
  
  // Deploy StadiumVaultBet with USDC token
  console.log("\n🏟️ Deploying StadiumVaultBet contract...");
  const StadiumVaultBet = await ethers.getContractFactory("StadiumVaultBet");
  const stadiumVault = await StadiumVaultBet.deploy(deployer.address, usdcAddress);
  await stadiumVault.waitForDeployment();
  const stadiumAddress = await stadiumVault.getAddress();
  console.log("✅ StadiumVaultBet deployed at:", stadiumAddress);
  
  // Create test games
  console.log("\n⚽ Creating test games...");
  const games = [
    {
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      endTime: Math.floor(Date.now() / 1000) + 7200    // 2 hours from now
    },
    {
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      startTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
      endTime: Math.floor(Date.now() / 1000) + 10800   // 3 hours from now
    },
    {
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      startTime: Math.floor(Date.now() / 1000) + 10800, // 3 hours from now
      endTime: Math.floor(Date.now() / 1000) + 14400    // 4 hours from now
    }
  ];
  
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const tx = await stadiumVault.createGame(
      game.homeTeam,
      game.awayTeam,
      game.startTime,
      game.endTime
    );
    await tx.wait();
    console.log(`✅ Game ${i + 1} created: ${game.homeTeam} vs ${game.awayTeam}`);
  }
  
  // Set initial odds for games
  console.log("\n📊 Setting initial odds...");
  const odds = [
    { home: 180, away: 200, draw: 320 }, // Man Utd vs Liverpool
    { home: 190, away: 190, draw: 300 }, // Barcelona vs Real Madrid
    { home: 200, away: 180, draw: 320 }  // Arsenal vs Chelsea
  ];
  
  for (let i = 0; i < odds.length; i++) {
    const gameOdds = odds[i];
    // Note: In a real implementation, you would use FHE encryption for odds
    // For now, we'll skip the odds setting as it requires FHE encryption
    console.log(`📈 Game ${i + 1} odds: Home ${gameOdds.home}, Away ${gameOdds.away}, Draw ${gameOdds.draw}`);
  }
  
  // Distribute test USDC to deployer
  console.log("\n💰 Distributing test USDC...");
  const faucetAmount = ethers.parseUnits("1000", 6); // 1000 USDC
  await usdcToken.faucet(deployer.address, faucetAmount);
  console.log("✅ Distributed 1000 USDC to deployer");
  
  // Check balances
  const deployerBalance = await usdcToken.balanceOf(deployer.address);
  const vaultBalance = await stadiumVault.getUSDCBalance();
  
  console.log("\n📊 Final Balances:");
  console.log("Deployer USDC balance:", ethers.formatUnits(deployerBalance, 6), "USDC");
  console.log("Vault USDC balance:", ethers.formatUnits(vaultBalance, 6), "USDC");
  
  // Save deployment info
  const deploymentInfo = {
    usdcToken: {
      address: usdcAddress,
      name: "Test USDC",
      symbol: "tUSDC",
      decimals: 6
    },
    stadiumVault: {
      address: stadiumAddress,
      name: "StadiumVaultBet"
    },
    deployer: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString(),
    games: games.map((game, index) => ({
      id: index,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      startTime: game.startTime,
      endTime: game.endTime
    }))
  };
  
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎉 Initialization complete!");
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("\n🔗 Contract Addresses:");
  console.log("USDC Token:", usdcAddress);
  console.log("Stadium Vault:", stadiumAddress);
}

main().catch((error) => {
  console.error("❌ Initialization failed:", error);
  process.exit(1);
});
