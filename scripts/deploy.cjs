const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.log("No signer available. Ensure PRIVATE_KEY is set in .env");
    process.exit(1);
  }

  const deployer = signers[0];
  console.log("Deploying with:", deployer.address);
  const bal = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  const StadiumVaultBet = await ethers.getContractFactory("StadiumVaultBet");
  const contract = await StadiumVaultBet.deploy(deployer.address);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("StadiumVaultBet deployed:", address);

  const artifact = await artifacts.readArtifact("StadiumVaultBet");
  const abi = JSON.stringify(artifact.abi);
  const deploymentInfo = {
    contractAddress: address,
    deployer: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString(),
    abi: artifact.abi
  };

  const deploymentPath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  const contractsPath = path.join(__dirname, "../src/lib/contracts.ts");
  const contractsContent = `// Auto-generated contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  StadiumVaultBet: "${address}",
};

export const CONTRACT_ABIS = {
  StadiumVaultBet: ${abi},
};
`;
  fs.writeFileSync(contractsPath, contractsContent);

  console.log("Saved:", deploymentPath);
  console.log("Updated:", contractsPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
