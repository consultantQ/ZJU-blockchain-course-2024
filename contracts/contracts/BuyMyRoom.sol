// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./MyERC20.sol";

contract BuyMyRoom is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseUnlisted(uint256 tokenId);
    event HouseBought(uint256 tokenId, uint256 price, address buyer);
    struct House {
        address owner;
        uint256 tokenId;
        bool isListed;
        uint256 listedStartTimestamp;
        uint256 price;
    }

    mapping(uint256 => House) public houses; // A map from house-index to its information
    mapping(address => bool) public initUsers; // A map from user address to its initialization status

    uint256 public _tokenIdCounter;
    address public platform;
    uint256 public feeRate;

    MyERC20 public myERC20;

    constructor() ERC721("BuyMyRoom", "BMR") {
        _tokenIdCounter = 0;
        platform = msg.sender;
        feeRate = 1; // 1%
    }

    function mint(address to) internal {
        _safeMint(to, _tokenIdCounter);
        houses[_tokenIdCounter] = House(to, _tokenIdCounter, false, 0, 0);
        _tokenIdCounter++;
        console.log("Total houses: %s", _tokenIdCounter);
    }

    function initUserHouse() external {
        require(!initUsers[msg.sender], "User already initialized");
        mint(msg.sender);
        mint(msg.sender);
        initUsers[msg.sender] = true;
        console.log("Initialized user: %s", msg.sender);
    }

    function listHouse(uint256 tokenId, uint256 price) external returns (House memory) {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(houses[tokenId].owner != address(0), "House does not exist");
        require(price > 0, "Price must be greater than 0");
        require(!houses[tokenId].isListed, "House is already listed");
        houses[tokenId].isListed = true;
        houses[tokenId].price = price;
        houses[tokenId].listedStartTimestamp = block.timestamp;
        emit HouseListed(tokenId, price, msg.sender);
        return houses[tokenId];
    }

    function unListHouse(uint256 tokenId) external returns (House memory) {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(houses[tokenId].isListed, "House is not listed");
        houses[tokenId].isListed = false;
        houses[tokenId].price = 0;
        houses[tokenId].listedStartTimestamp = 0;
        emit HouseUnlisted(tokenId);
        return houses[tokenId];
    }

    function getMyHouses() external view returns(House[] memory) {
        uint256 balance = balanceOf(msg.sender);
        House[] memory myHouses = new House[](balance);
        if (balance == 0) {
            return myHouses;
        }
        uint256 j = 0;
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            if (ownerOf(i) == msg.sender) {
                myHouses[j] = houses[i];
                j++;
            }
        }
        return myHouses;
    }

    function getMyListingHouses() external view returns(House[] memory) {
        uint256 listNum = 0;
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            if (ownerOf(i) == msg.sender && houses[i].isListed) {
                listNum++;
            }
        }
        House[] memory myListingHouses = new House[](listNum);
        uint256 j = 0;
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            if (ownerOf(i) == msg.sender && houses[i].isListed) {
                myListingHouses[j] = houses[i];
                j++;
            }
        }
        return myListingHouses;
    }

    function getTotalHouses() external view returns(House[] memory) {
        House[] memory totalHouses = new House[](_tokenIdCounter);
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            totalHouses[i] = houses[i];
        }
        return totalHouses;
    }

    function getTotalListingHouses() external view returns(House[] memory) {
        uint256 listNum = 0;
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            if (houses[i].isListed) {
                listNum++;
            }
        }
        House[] memory listingHouses = new House[](listNum);
        uint256 j = 0;
        for (uint256 i=0; i < _tokenIdCounter; i++) {
            if (houses[i].isListed) {
                listingHouses[j] = houses[i];
                j++;
            }
        }
        return listingHouses;
    }

    function buyHouse(uint256 tokenId) external payable returns (House memory) {
        require(houses[tokenId].isListed, "House is not listed");
        require(houses[tokenId].price > 0 && houses[tokenId].listedStartTimestamp > 0, "House price and listedStartTimestamp need to be bigger than 0");
        require(ownerOf(tokenId) != msg.sender, "You are the owner of this house");
        require(msg.value >= houses[tokenId].price, "Insufficient funds");
        address owner = houses[tokenId].owner;
        uint256 price = houses[tokenId].price;
        uint256 listingTimestamp = block.timestamp - houses[tokenId].listedStartTimestamp;
        uint256 fee = listingTimestamp / 60 * price * feeRate / 100;
        uint256 maxFee = price * feeRate * 20 / 100;
        if (fee > maxFee) {
            fee = maxFee;
        }
        payable(platform).transfer(fee);
        payable(owner).transfer(price - fee);
        _transfer(owner, msg.sender, tokenId);
        houses[tokenId].owner = msg.sender;
        houses[tokenId].isListed = false;
        houses[tokenId].price = 0;
        houses[tokenId].listedStartTimestamp = 0;
        emit HouseBought(tokenId, price / 1 ether, msg.sender);
        return houses[tokenId];
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }
}