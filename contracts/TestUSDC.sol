// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDC is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(address initialOwner) ERC20("Test USDC", "tUSDC") Ownable(initialOwner) {
        _decimals = 6; // USDC has 6 decimals
        _mint(initialOwner, 1000000 * 10**_decimals); // Mint 1M test USDC
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Faucet function for testing
    function faucet(address to, uint256 amount) external {
        require(amount <= 1000 * 10**_decimals, "Max 1000 USDC per faucet");
        _mint(to, amount);
    }
    
    // Additional minting for owner
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
