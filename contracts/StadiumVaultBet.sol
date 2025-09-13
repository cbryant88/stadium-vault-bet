// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract StadiumVaultBet is SepoliaConfig {
    using FHE for *;
    
    struct Bet {
        euint32 betId;
        euint32 amount;
        euint32 odds;
        euint8 teamSelection; // 0: home, 1: away, 2: draw
        bool isActive;
        bool isSettled;
        address bettor;
        uint256 gameId;
        uint256 timestamp;
    }
    
    struct Game {
        euint32 gameId;
        string homeTeam;
        string awayTeam;
        euint32 homeScore;
        euint32 awayScore;
        euint32 homeOdds;
        euint32 awayOdds;
        euint32 drawOdds;
        bool isActive;
        bool isFinished;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct BettingPool {
        euint32 totalBets;
        euint32 totalAmount;
        euint32 homeBets;
        euint32 awayBets;
        euint32 drawBets;
    }
    
    mapping(uint256 => Game) public games;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => BettingPool) public bettingPools;
    mapping(address => euint32) public userReputation;
    mapping(address => euint32) public userTotalBets;
    mapping(address => euint32) public userTotalWinnings;
    
    uint256 public gameCounter;
    uint256 public betCounter;
    
    address public owner;
    address public oracle;
    
    event GameCreated(uint256 indexed gameId, string homeTeam, string awayTeam);
    event BetPlaced(uint256 indexed betId, uint256 indexed gameId, address indexed bettor, uint32 amount);
    event GameSettled(uint256 indexed gameId, uint32 homeScore, uint32 awayScore);
    event BetSettled(uint256 indexed betId, bool isWinner, uint32 payout);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this function");
        _;
    }
    
    function createGame(
        string memory _homeTeam,
        string memory _awayTeam,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOwner returns (uint256) {
        require(bytes(_homeTeam).length > 0, "Home team name cannot be empty");
        require(bytes(_awayTeam).length > 0, "Away team name cannot be empty");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        uint256 gameId = gameCounter++;
        
        games[gameId] = Game({
            gameId: FHE.asEuint32(0), // Will be set properly later
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            homeScore: FHE.asEuint32(0),
            awayScore: FHE.asEuint32(0),
            homeOdds: FHE.asEuint32(0), // Will be set via FHE operations
            awayOdds: FHE.asEuint32(0), // Will be set via FHE operations
            drawOdds: FHE.asEuint32(0), // Will be set via FHE operations
            isActive: true,
            isFinished: false,
            startTime: _startTime,
            endTime: _endTime
        });
        
        bettingPools[gameId] = BettingPool({
            totalBets: FHE.asEuint32(0),
            totalAmount: FHE.asEuint32(0),
            homeBets: FHE.asEuint32(0),
            awayBets: FHE.asEuint32(0),
            drawBets: FHE.asEuint32(0)
        });
        
        emit GameCreated(gameId, _homeTeam, _awayTeam);
        return gameId;
    }
    
    function updateOdds(
        uint256 gameId,
        externalEuint32 homeOdds,
        externalEuint32 awayOdds,
        externalEuint32 drawOdds,
        bytes calldata inputProof
    ) public onlyOracle {
        require(games[gameId].isActive, "Game is not active");
        require(block.timestamp < games[gameId].endTime, "Game has ended");
        
        // Convert external euint32 to internal euint32
        euint32 internalHomeOdds = FHE.fromExternal(homeOdds, inputProof);
        euint32 internalAwayOdds = FHE.fromExternal(awayOdds, inputProof);
        euint32 internalDrawOdds = FHE.fromExternal(drawOdds, inputProof);
        
        games[gameId].homeOdds = internalHomeOdds;
        games[gameId].awayOdds = internalAwayOdds;
        games[gameId].drawOdds = internalDrawOdds;
    }
    
    function placeBet(
        uint256 gameId,
        externalEuint32 amount,
        externalEuint8 teamSelection,
        bytes calldata inputProof
    ) public payable returns (uint256) {
        require(games[gameId].isActive, "Game is not active");
        require(block.timestamp < games[gameId].endTime, "Game has ended");
        require(msg.value > 0, "Bet amount must be greater than 0");
        
        uint256 betId = betCounter++;
        
        // Convert external values to internal FHE values
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint8 internalTeamSelection = FHE.fromExternal(teamSelection, inputProof);
        
        bets[betId] = Bet({
            betId: FHE.asEuint32(0), // Will be set properly later
            amount: internalAmount,
            odds: FHE.asEuint32(0), // Will be set based on team selection
            teamSelection: internalTeamSelection,
            isActive: true,
            isSettled: false,
            bettor: msg.sender,
            gameId: gameId,
            timestamp: block.timestamp
        });
        
        // Update betting pool
        BettingPool storage pool = bettingPools[gameId];
        pool.totalBets = FHE.add(pool.totalBets, FHE.asEuint32(1));
        pool.totalAmount = FHE.add(pool.totalAmount, internalAmount);
        
        // Update user statistics
        userTotalBets[msg.sender] = FHE.add(userTotalBets[msg.sender], internalAmount);
        
        emit BetPlaced(betId, gameId, msg.sender, 0); // Amount will be decrypted off-chain
        return betId;
    }
    
    function settleGame(
        uint256 gameId,
        externalEuint32 homeScore,
        externalEuint32 awayScore,
        bytes calldata inputProof
    ) public onlyOracle {
        require(games[gameId].isActive, "Game is not active");
        require(block.timestamp >= games[gameId].endTime, "Game has not ended yet");
        
        // Convert external scores to internal FHE values
        euint32 internalHomeScore = FHE.fromExternal(homeScore, inputProof);
        euint32 internalAwayScore = FHE.fromExternal(awayScore, inputProof);
        
        games[gameId].homeScore = internalHomeScore;
        games[gameId].awayScore = internalAwayScore;
        games[gameId].isFinished = true;
        games[gameId].isActive = false;
        
        emit GameSettled(gameId, 0, 0); // Scores will be decrypted off-chain
        
        // Settle all bets for this game
        _settleBetsForGame(gameId, internalHomeScore, internalAwayScore);
    }
    
    function _settleBetsForGame(uint256 gameId, euint32 homeScore, euint32 awayScore) internal {
        // This is a simplified version - in practice, you'd need to iterate through all bets
        // and determine winners based on encrypted score comparison
        
        // For now, we'll emit events for bet settlement
        // The actual settlement logic would need to be implemented based on specific requirements
    }
    
    function settleBet(uint256 betId, bool isWinner, externalEuint32 payout, bytes calldata inputProof) public onlyOracle {
        require(bets[betId].isActive, "Bet is not active");
        require(!bets[betId].isSettled, "Bet is already settled");
        
        euint32 internalPayout = FHE.fromExternal(payout, inputProof);
        
        bets[betId].isSettled = true;
        bets[betId].isActive = false;
        
        if (isWinner) {
            userTotalWinnings[bets[betId].bettor] = FHE.add(userTotalWinnings[bets[betId].bettor], internalPayout);
            
            // Transfer winnings to bettor
            payable(bets[betId].bettor).transfer(0); // Amount will be determined off-chain
        }
        
        emit BetSettled(betId, isWinner, 0); // Payout will be decrypted off-chain
    }
    
    function updateUserReputation(address user, euint32 reputation) public onlyOracle {
        require(user != address(0), "Invalid user address");
        
        userReputation[user] = reputation;
        emit ReputationUpdated(user, 0); // Reputation will be decrypted off-chain
    }
    
    function getGameInfo(uint256 gameId) public view returns (
        string memory homeTeam,
        string memory awayTeam,
        uint8 homeScore,
        uint8 awayScore,
        uint8 homeOdds,
        uint8 awayOdds,
        uint8 drawOdds,
        bool isActive,
        bool isFinished,
        uint256 startTime,
        uint256 endTime
    ) {
        Game storage game = games[gameId];
        return (
            game.homeTeam,
            game.awayTeam,
            0, // FHE.decrypt(game.homeScore) - will be decrypted off-chain
            0, // FHE.decrypt(game.awayScore) - will be decrypted off-chain
            0, // FHE.decrypt(game.homeOdds) - will be decrypted off-chain
            0, // FHE.decrypt(game.awayOdds) - will be decrypted off-chain
            0, // FHE.decrypt(game.drawOdds) - will be decrypted off-chain
            game.isActive,
            game.isFinished,
            game.startTime,
            game.endTime
        );
    }
    
    function getBetInfo(uint256 betId) public view returns (
        uint8 amount,
        uint8 odds,
        uint8 teamSelection,
        bool isActive,
        bool isSettled,
        address bettor,
        uint256 gameId,
        uint256 timestamp
    ) {
        Bet storage bet = bets[betId];
        return (
            0, // FHE.decrypt(bet.amount) - will be decrypted off-chain
            0, // FHE.decrypt(bet.odds) - will be decrypted off-chain
            0, // FHE.decrypt(bet.teamSelection) - will be decrypted off-chain
            bet.isActive,
            bet.isSettled,
            bet.bettor,
            bet.gameId,
            bet.timestamp
        );
    }
    
    function getUserStats(address user) public view returns (
        uint8 totalBets,
        uint8 totalWinnings,
        uint8 reputation
    ) {
        return (
            0, // FHE.decrypt(userTotalBets[user]) - will be decrypted off-chain
            0, // FHE.decrypt(userTotalWinnings[user]) - will be decrypted off-chain
            0  // FHE.decrypt(userReputation[user]) - will be decrypted off-chain
        );
    }
    
    function getBettingPoolInfo(uint256 gameId) public view returns (
        uint8 totalBets,
        uint8 totalAmount,
        uint8 homeBets,
        uint8 awayBets,
        uint8 drawBets
    ) {
        BettingPool storage pool = bettingPools[gameId];
        return (
            0, // FHE.decrypt(pool.totalBets) - will be decrypted off-chain
            0, // FHE.decrypt(pool.totalAmount) - will be decrypted off-chain
            0, // FHE.decrypt(pool.homeBets) - will be decrypted off-chain
            0, // FHE.decrypt(pool.awayBets) - will be decrypted off-chain
            0  // FHE.decrypt(pool.drawBets) - will be decrypted off-chain
        );
    }
    
    function withdrawFunds(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }
    
    function setOracle(address _oracle) public onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
    }
}
