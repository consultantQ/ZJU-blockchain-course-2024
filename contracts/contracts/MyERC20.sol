// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) claimedAirdropPlayerList;

    constructor() ERC20("MyERC20", "ME2") {

    }

    function exchangeERC20() external payable {
        uint256 amount = msg.value / 1 ether; // 1 token per ETH
        _mint(msg.sender, amount);
    }
}