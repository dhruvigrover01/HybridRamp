// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HybridToken
 * @notice ERC-20 token for HybridRamp on-chain settlement
 * @dev Deployed on Sepolia testnet
 */
contract HybridToken is ERC20, Ownable {
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("HybridRamp Token", "HYBRID") Ownable(msg.sender) {
        // Mint 1 million tokens to owner
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
        emit TokensMinted(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }
}