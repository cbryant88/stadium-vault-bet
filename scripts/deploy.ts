import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy StadiumVaultBet contract
  const StadiumVaultBet = await ethers.getContractFactory("StadiumVaultBet");
  const stadiumVaultBet = await StadiumVaultBet.deploy(deployer.address); // Using deployer as oracle for now

  await stadiumVaultBet.waitForDeployment();

  const contractAddress = await stadiumVaultBet.getAddress();
  console.log("StadiumVaultBet deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
