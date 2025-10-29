// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, externalEuint8, ebool, externalEbool, FHE } from "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StadiumVaultBet is SepoliaConfig {
    using FHE for *;
    using SafeERC20 for IERC20;
    
    struct Bet {
        euint32 betId;
        euint32 amount;
        euint32 odds;
        euint8 teamSelection; // 0: home, 1: away, 2: draw
        ebool isWinner;
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
        ebool isActive;
        ebool isFinished;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct BettingPool {
        euint32 totalBets;
        euint32 totalAmount;
        euint32 homeBets;
        euint32 awayBets;
        euint32 drawBets;
        euint32 homeTotalAmount;
        euint32 awayTotalAmount;
        euint32 drawTotalAmount;
    }
    
    mapping(uint256 => Game) public games;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => BettingPool) public bettingPools;
    mapping(address => euint32) public userReputation;
    mapping(address => euint32) public userTotalBets;
    mapping(address => euint32) public userTotalWinnings;
    mapping(address => euint32) public userWinCount;
    
    // Vault functionality
    mapping(address => uint256) public userVaultBalance; // User's USDC balance in vault
    
    uint256 public gameCounter;
    uint256 public betCounter;
    
    address public owner;
    address public oracle;
    IERC20 public usdcToken;
    
    // FHE Constants (USDC amounts with 6 decimals)
    uint256 public constant MIN_BET_AMOUNT = 1000000; // 1 USDC
    uint256 public constant MAX_BET_AMOUNT = 100000000; // 100 USDC
    
    event GameCreated(uint256 indexed gameId, string homeTeam, string awayTeam);
    event BetPlaced(uint256 indexed betId, uint256 indexed gameId, address indexed bettor);
    event GameSettled(uint256 indexed gameId);
    event BetSettled(uint256 indexed betId, bool isWinner);
    event ReputationUpdated(address indexed user);
    event OddsUpdated(uint256 indexed gameId);
    event VaultDeposit(address indexed user, uint256 amount);
    event VaultWithdrawal(address indexed user, uint256 amount);
    
    constructor(address _oracle, address _usdcToken) {
        owner = msg.sender;
        oracle = _oracle;
        usdcToken = IERC20(_usdcToken);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this function");
        _;
    }
    
    modifier validGame(uint256 gameId) {
        require(gameId < gameCounter, "Game does not exist");
        _;
    }
    
    // Vault Functions
    function depositToVault(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        userVaultBalance[msg.sender] += amount;
        emit VaultDeposit(msg.sender, amount);
    }
    
    function withdrawFromVault(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(userVaultBalance[msg.sender] >= amount, "Insufficient vault balance");
        userVaultBalance[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        emit VaultWithdrawal(msg.sender, amount);
    }
    
    function getVaultBalance(address user) external view returns (uint256) {
        return userVaultBalance[user];
    }
    
    modifier validBet(uint256 betId) {
        require(betId < betCounter, "Bet does not exist");
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
        
        // Create game with minimal FHE operations for testing
        games[gameId] = Game({
            gameId: FHE.asEuint32(uint32(gameId)),
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            homeScore: FHE.asEuint32(0),
            awayScore: FHE.asEuint32(0),
            homeOdds: FHE.asEuint32(180),
            awayOdds: FHE.asEuint32(200),
            drawOdds: FHE.asEuint32(320),
            isActive: FHE.asEbool(true),
            isFinished: FHE.asEbool(false),
            startTime: _startTime,
            endTime: _endTime
        });
        
        // Create betting pool with minimal FHE operations
        bettingPools[gameId] = BettingPool({
            totalBets: FHE.asEuint32(0),
            totalAmount: FHE.asEuint32(0),
            homeBets: FHE.asEuint32(0),
            awayBets: FHE.asEuint32(0),
            drawBets: FHE.asEuint32(0),
            homeTotalAmount: FHE.asEuint32(0),
            awayTotalAmount: FHE.asEuint32(0),
            drawTotalAmount: FHE.asEuint32(0)
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
    ) public onlyOracle validGame(gameId) {
        Game storage game = games[gameId];
        
        // Convert external euint32 to internal euint32
        euint32 internalHomeOdds = FHE.fromExternal(homeOdds, inputProof);
        euint32 internalAwayOdds = FHE.fromExternal(awayOdds, inputProof);
        euint32 internalDrawOdds = FHE.fromExternal(drawOdds, inputProof);
        
        game.homeOdds = internalHomeOdds;
        game.awayOdds = internalAwayOdds;
        game.drawOdds = internalDrawOdds;
        
        // Set ACL permissions for odds
        FHE.allowThis(game.homeOdds);
        FHE.allowThis(game.awayOdds);
        FHE.allowThis(game.drawOdds);
        
        emit OddsUpdated(gameId);
    }
    
    function placeBet(
        uint256 gameId,
        externalEuint32 amount,
        externalEuint8 teamSelection,
        bytes calldata inputProof,
        uint256 usdcAmount
    ) public validGame(gameId) returns (uint256) {
        Game storage game = games[gameId];
        require(block.timestamp < game.endTime, "Game has ended");
        
        uint256 betId = betCounter++;
        
        // Convert external values to internal FHE values
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint8 internalTeamSelection = FHE.fromExternal(teamSelection, inputProof);
        
        // Deduct USDC from user's vault balance using the provided amount
        require(usdcAmount >= MIN_BET_AMOUNT, "Bet amount below minimum");
        require(userVaultBalance[msg.sender] >= usdcAmount, "Insufficient vault balance");
        userVaultBalance[msg.sender] -= usdcAmount;
        
        // Get the appropriate odds based on team selection
        euint32 selectedOdds = FHE.select(
            FHE.eq(internalTeamSelection, FHE.asEuint8(0)), // home
            game.homeOdds,
            FHE.select(
                FHE.eq(internalTeamSelection, FHE.asEuint8(1)), // away
                game.awayOdds,
                game.drawOdds // draw
            )
        );
        
        bets[betId] = Bet({
            betId: FHE.asEuint32(uint32(betId)),
            amount: internalAmount,
            odds: selectedOdds,
            teamSelection: internalTeamSelection,
            isWinner: FHE.asEbool(false),
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
        
        // Update team-specific statistics
        ebool isHome = FHE.eq(internalTeamSelection, FHE.asEuint8(0));
        ebool isAway = FHE.eq(internalTeamSelection, FHE.asEuint8(1));
        ebool isDraw = FHE.eq(internalTeamSelection, FHE.asEuint8(2));
        
        pool.homeBets = FHE.add(pool.homeBets, FHE.select(isHome, FHE.asEuint32(1), FHE.asEuint32(0)));
        pool.awayBets = FHE.add(pool.awayBets, FHE.select(isAway, FHE.asEuint32(1), FHE.asEuint32(0)));
        pool.drawBets = FHE.add(pool.drawBets, FHE.select(isDraw, FHE.asEuint32(1), FHE.asEuint32(0)));
        
        pool.homeTotalAmount = FHE.add(pool.homeTotalAmount, FHE.select(isHome, internalAmount, FHE.asEuint32(0)));
        pool.awayTotalAmount = FHE.add(pool.awayTotalAmount, FHE.select(isAway, internalAmount, FHE.asEuint32(0)));
        pool.drawTotalAmount = FHE.add(pool.drawTotalAmount, FHE.select(isDraw, internalAmount, FHE.asEuint32(0)));
        
        // Update user statistics
        userTotalBets[msg.sender] = FHE.add(userTotalBets[msg.sender], internalAmount);
        
        // Set ACL permissions for bet data
        FHE.allowThis(bets[betId].amount);
        FHE.allowThis(bets[betId].odds);
        FHE.allowThis(bets[betId].teamSelection);
        FHE.allowThis(bets[betId].isWinner);
        FHE.allow(bets[betId].amount, msg.sender);
        FHE.allow(bets[betId].odds, msg.sender);
        FHE.allow(bets[betId].teamSelection, msg.sender);
        FHE.allow(bets[betId].isWinner, msg.sender);
        
        emit BetPlaced(betId, gameId, msg.sender);
        return betId;
    }
    
    function settleGame(
        uint256 gameId,
        externalEuint32 homeScore,
        externalEuint32 awayScore,
        bytes calldata inputProof
    ) public onlyOracle validGame(gameId) {
        Game storage game = games[gameId];
        require(block.timestamp >= game.endTime, "Game has not ended yet");
        
        // Convert external scores to internal FHE values
        euint32 internalHomeScore = FHE.fromExternal(homeScore, inputProof);
        euint32 internalAwayScore = FHE.fromExternal(awayScore, inputProof);
        
        game.homeScore = internalHomeScore;
        game.awayScore = internalAwayScore;
        game.isFinished = FHE.asEbool(true);
        game.isActive = FHE.asEbool(false);
        
        // Set ACL permissions for scores
        FHE.allowThis(game.homeScore);
        FHE.allowThis(game.awayScore);
        
        emit GameSettled(gameId);
        
        // Settle all bets for this game
        _settleBetsForGame(gameId, internalHomeScore, internalAwayScore);
    }
    
    function _settleBetsForGame(uint256 gameId, euint32 homeScore, euint32 awayScore) internal {
        // This function would iterate through all bets for the game
        // and determine winners based on encrypted score comparison
        // For now, we'll emit events for bet settlement
        // The actual settlement logic would need to be implemented based on specific requirements
        
        // In a real implementation, you would:
        // 1. Iterate through all bets for this game
        // 2. Compare encrypted scores to determine winners
        // 3. Update bet status and calculate payouts
        // 4. Transfer winnings to winners
    }
    
    function settleBet(
        uint256 betId, 
        externalEbool isWinner, 
        externalEuint32 payout, 
        bytes calldata inputProof
    ) public onlyOracle validBet(betId) {
        Bet storage bet = bets[betId];
        require(bet.isActive, "Bet is not active");
        require(!bet.isSettled, "Bet is already settled");
        
        euint32 internalPayout = FHE.fromExternal(payout, inputProof);
        ebool internalIsWinner = FHE.fromExternal(isWinner, inputProof);
        
        bet.isSettled = true;
        bet.isActive = false;
        bet.isWinner = internalIsWinner;
        
        // Update user statistics
        userTotalWinnings[bet.bettor] = FHE.add(
            userTotalWinnings[bet.bettor], 
            FHE.select(internalIsWinner, internalPayout, FHE.asEuint32(0))
        );
        
        userWinCount[bet.bettor] = FHE.add(
            userWinCount[bet.bettor],
            FHE.select(internalIsWinner, FHE.asEuint32(1), FHE.asEuint32(0))
        );
        
        // Set ACL permissions for updated data
        FHE.allowThis(bet.isWinner);
        FHE.allow(bet.isWinner, bet.bettor);
        
        emit BetSettled(betId, false); // Winner status will be decrypted off-chain
        
        // Transfer winnings to bettor (amount determined off-chain)
        // Note: In a real implementation, this would be handled off-chain
        // as FHE decryption cannot be performed directly in the contract
    }
    
    function updateUserReputation(address user, externalEuint32 reputation, bytes calldata inputProof) public onlyOracle {
        require(user != address(0), "Invalid user address");
        
        euint32 internalReputation = FHE.fromExternal(reputation, inputProof);
        userReputation[user] = internalReputation;
        
        // Set ACL permissions
        FHE.allowThis(userReputation[user]);
        FHE.allow(userReputation[user], user);
        
        emit ReputationUpdated(user);
    }
    
    // View functions for encrypted data (will be decrypted off-chain)
    function getGameEncryptedData(uint256 gameId) public view validGame(gameId) returns (
        bytes32 homeScore,
        bytes32 awayScore,
        bytes32 homeOdds,
        bytes32 awayOdds,
        bytes32 drawOdds,
        bytes32 isActive,
        bytes32 isFinished
    ) {
        Game storage game = games[gameId];
        return (
            FHE.toBytes32(game.homeScore),
            FHE.toBytes32(game.awayScore),
            FHE.toBytes32(game.homeOdds),
            FHE.toBytes32(game.awayOdds),
            FHE.toBytes32(game.drawOdds),
            FHE.toBytes32(game.isActive),
            FHE.toBytes32(game.isFinished)
        );
    }
    
    function getBetEncryptedData(uint256 betId) public view validBet(betId) returns (
        bytes32 amount,
        bytes32 odds,
        bytes32 teamSelection,
        bytes32 isWinner
    ) {
        Bet storage bet = bets[betId];
        return (
            FHE.toBytes32(bet.amount),
            FHE.toBytes32(bet.odds),
            FHE.toBytes32(bet.teamSelection),
            FHE.toBytes32(bet.isWinner)
        );
    }
    
    function getBettingPoolEncryptedData(uint256 gameId) public view validGame(gameId) returns (
        bytes32 totalBets,
        bytes32 totalAmount,
        bytes32 homeBets,
        bytes32 awayBets,
        bytes32 drawBets,
        bytes32 homeTotalAmount,
        bytes32 awayTotalAmount,
        bytes32 drawTotalAmount
    ) {
        BettingPool storage pool = bettingPools[gameId];
        return (
            FHE.toBytes32(pool.totalBets),
            FHE.toBytes32(pool.totalAmount),
            FHE.toBytes32(pool.homeBets),
            FHE.toBytes32(pool.awayBets),
            FHE.toBytes32(pool.drawBets),
            FHE.toBytes32(pool.homeTotalAmount),
            FHE.toBytes32(pool.awayTotalAmount),
            FHE.toBytes32(pool.drawTotalAmount)
        );
    }
    
    function getUserEncryptedStats(address user) public view returns (
        bytes32 totalBets,
        bytes32 totalWinnings,
        bytes32 winCount,
        bytes32 reputation
    ) {
        return (
            FHE.toBytes32(userTotalBets[user]),
            FHE.toBytes32(userTotalWinnings[user]),
            FHE.toBytes32(userWinCount[user]),
            FHE.toBytes32(userReputation[user])
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
    
    // Public view functions for non-encrypted data
    function getGameBasicInfo(uint256 gameId) public view validGame(gameId) returns (
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        bool isFinished
    ) {
        Game storage game = games[gameId];
        return (
            game.startTime,
            game.endTime,
            true, // For now, always return true for isActive
            false // For now, always return false for isFinished
        );
    }
    
    function getBetBasicInfo(uint256 betId) public view validBet(betId) returns (
        bool isActive,
        bool isSettled,
        address bettor,
        uint256 gameId,
        uint256 timestamp
    ) {
        Bet storage bet = bets[betId];
        return (
            bet.isActive,
            bet.isSettled,
            bet.bettor,
            bet.gameId,
            bet.timestamp
        );
    }
    
    // Utility functions
    function getGameCount() public view returns (uint256) {
        return gameCounter;
    }
    
    function getBetCount() public view returns (uint256) {
        return betCounter;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // USDC related functions
    function getUSDCBalance() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
    
    function getUserUSDCBalance(address user) public view returns (uint256) {
        return usdcToken.balanceOf(user);
    }
    
    function approveUSDC(address spender, uint256 amount) public {
        usdcToken.approve(spender, amount);
    }
    
    function withdrawUSDC(uint256 amount) public onlyOwner {
        usdcToken.safeTransfer(owner, amount);
    }
}
