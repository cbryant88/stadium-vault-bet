const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing createGame function...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Get the deployed contract
  const stadiumAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const StadiumVaultBet = await ethers.getContractFactory("StadiumVaultBet");
  const stadiumVault = StadiumVaultBet.attach(stadiumAddress);
  
  // Test basic contract interaction
  console.log("🔄 Testing basic contract calls...");
  try {
    const owner = await stadiumVault.owner();
    console.log("✅ Owner:", owner);
    
    const gameCount = await stadiumVault.gameCounter();
    console.log("✅ Game count:", gameCount.toString());
    
    // Test a simple call first
    console.log("🔄 Testing getVaultBalance...");
    const vaultBalance = await stadiumVault.getVaultBalance(deployer.address);
    console.log("✅ Vault balance:", ethers.formatUnits(vaultBalance, 6), "USDC");
    
  } catch (error) {
    console.error("❌ Basic contract call failed:", error.message);
    return;
  }
  
  // Now test createGame
  console.log("\n🔄 Testing createGame...");
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  
  try {
    console.log("Creating game with params:", {
      homeTeam: "Test Home",
      awayTeam: "Test Away", 
      startTime: now + oneDay,
      endTime: now + oneDay + 7200
    });
    
    const tx = await stadiumVault.createGame(
      "Test Home",
      "Test Away",
      now + oneDay,
      now + oneDay + 7200
    );
    
    console.log("✅ Transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Game created successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check if game was actually created
    const newGameCount = await stadiumVault.gameCounter();
    console.log("New game count:", newGameCount.toString());
    
  } catch (error) {
    console.error("❌ createGame failed:", error.message);
    console.error("Error details:", {
      code: error.code,
      reason: error.reason,
      data: error.data
    });
  }
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
