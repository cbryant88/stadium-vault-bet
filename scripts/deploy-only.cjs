const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment script...");
  
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
  
  // Distribute test USDC to deployer
  console.log("\n💰 Distributing test USDC...");
  const faucetAmount = ethers.parseUnits("1000", 6); // 1000 USDC
  await usdcToken.faucet(deployer.address, faucetAmount);
  console.log("✅ Distributed 1000 USDC to deployer");
  
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
    timestamp: new Date().toISOString()
  };
  
  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎉 Deployment complete!");
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("\n🔗 Contract Addresses:");
  console.log("USDC Token:", usdcAddress);
  console.log("Stadium Vault:", stadiumAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
