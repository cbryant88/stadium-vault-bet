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
  
  // Verify owner
  const owner = await stadiumVault.owner();
  console.log("Contract owner:", owner);
  console.log("Deployer address:", deployer.address);
  
  // Create test games (spread over next 30 days)
  console.log("\n⚽ Creating test games for the next 30 days...");
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60; // 1 day in seconds
  const gameDuration = 2 * 60 * 60; // 2 hours game duration

  const games = [
    {
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      startTime: now + (7 * oneDay), // 7 days from now
      endTime: now + (7 * oneDay) + gameDuration
    },
    {
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      startTime: now + (14 * oneDay), // 14 days from now
      endTime: now + (14 * oneDay) + gameDuration
    },
    {
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      startTime: now + (21 * oneDay), // 21 days from now
      endTime: now + (21 * oneDay) + gameDuration
    },
    {
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      startTime: now + (28 * oneDay), // 28 days from now
      endTime: now + (28 * oneDay) + gameDuration
    },
    {
      homeTeam: "AC Milan",
      awayTeam: "Inter Milan",
      startTime: now + (30 * oneDay), // 30 days from now
      endTime: now + (30 * oneDay) + gameDuration
    }
  ];
  
  // Try to create games with error handling
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    try {
      console.log(`🔄 Creating game ${i + 1}: ${game.homeTeam} vs ${game.awayTeam}`);
      const tx = await stadiumVault.createGame(
        game.homeTeam,
        game.awayTeam,
        game.startTime,
        game.endTime
      );
      const receipt = await tx.wait();
      console.log(`✅ Game ${i + 1} created successfully. Gas used: ${receipt.gasUsed}`);
    } catch (error) {
      console.error(`❌ Failed to create game ${i + 1}:`, error.message);
      console.error(`Error details:`, {
        code: error.code,
        reason: error.reason,
        data: error.data,
        stack: error.stack
      });
      
      // Try to get more details about the transaction
      if (error.transaction) {
        console.error(`Transaction details:`, {
          to: error.transaction.to,
          data: error.transaction.data,
          value: error.transaction.value,
          gasLimit: error.transaction.gasLimit
        });
      }
      // Continue with other games even if one fails
    }
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
  
  // Deposit some USDC to vault for testing
  console.log("\n🏦 Depositing USDC to vault...");
  const depositAmount = ethers.parseUnits("500", 6); // 500 USDC
  try {
    // First approve the transfer
    const approveTx = await usdcToken.approve(stadiumAddress, depositAmount);
    await approveTx.wait();
    console.log("✅ USDC transfer approved");
    
    // Then deposit to vault
    const depositTx = await stadiumVault.depositToVault(depositAmount);
    await depositTx.wait();
    console.log("✅ Deposited 500 USDC to vault");
  } catch (error) {
    console.error("❌ Failed to deposit to vault:", error.message);
  }
  
  // Check balances
  const deployerBalance = await usdcToken.balanceOf(deployer.address);
  const vaultBalance = await stadiumVault.getVaultBalance(deployer.address);
  
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
