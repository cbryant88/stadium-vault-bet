const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Testing contract calls...");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const contractAddress = "0x088C35C09e15b4781495AB48838035b19f0E8A01";
    
    // Create contract instance
    const contract = new ethers.Contract(
        contractAddress,
        [
            {
                "inputs": [],
                "name": "getGameCount",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "name": "games",
                "outputs": [
                    {"internalType": "bytes32", "name": "gameId", "type": "bytes32"},
                    {"internalType": "string", "name": "homeTeam", "type": "string"},
                    {"internalType": "string", "name": "awayTeam", "type": "string"},
                    {"internalType": "bytes32", "name": "homeScore", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "awayScore", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "homeOdds", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "awayOdds", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "drawOdds", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "isActive", "type": "bytes32"},
                    {"internalType": "bytes32", "name": "isFinished", "type": "bytes32"},
                    {"internalType": "uint256", "name": "startTime", "type": "uint256"},
                    {"internalType": "uint256", "name": "endTime", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
                "name": "getGameBasicInfo",
                "outputs": [
                    {"internalType": "uint256", "name": "startTime", "type": "uint256"},
                    {"internalType": "uint256", "name": "endTime", "type": "uint256"},
                    {"internalType": "bool", "name": "isActive", "type": "bool"},
                    {"internalType": "bool", "name": "isFinished", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ],
        deployer
    );

    try {
        console.log("\n📊 Testing getGameCount...");
        const gameCount = await contract.getGameCount();
        console.log("Game count:", gameCount.toString());

        if (gameCount > 0) {
            console.log("\n🎮 Testing game data...");
            for (let i = 0; i < Math.min(3, Number(gameCount)); i++) {
                console.log(`\n--- Game ${i} ---`);
                
                try {
                    const gameData = await contract.games(i);
                    const basicInfo = await contract.getGameBasicInfo(i);
                    
                    console.log("Home Team:", gameData.homeTeam);
                    console.log("Away Team:", gameData.awayTeam);
                    console.log("Start Time (raw):", basicInfo.startTime.toString());
                    console.log("End Time (raw):", basicInfo.endTime.toString());
                    console.log("Start Time (date):", new Date(Number(basicInfo.startTime.toString()) * 1000).toLocaleString());
                    console.log("End Time (date):", new Date(Number(basicInfo.endTime.toString()) * 1000).toLocaleString());
                    console.log("Is Active:", basicInfo.isActive);
                    console.log("Is Finished:", basicInfo.isFinished);
                } catch (error) {
                    console.error(`Error loading game ${i}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error("❌ Contract call failed:", error.message);
    }
}

main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exitCode = 1;
});
