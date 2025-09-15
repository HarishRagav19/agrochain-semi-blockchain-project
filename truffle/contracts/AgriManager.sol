// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriManager {
    struct Farm {
        uint256 id;
        string owner;
        string name;
        string location;
        uint256 createdAt;
    }

    struct Crop {
        uint256 id;
        uint256 farmId;
        string cropType;
        uint256 quantity;
        uint256 plantedAt;
    }

    uint256 public farmCount;
    uint256 public cropCount;

    mapping(uint256 => Farm) public farms;
    mapping(uint256 => Crop) public crops;

    event FarmAdded(uint256 indexed id, string owner, string name, string location, uint256 createdAt);
    event CropAdded(uint256 indexed id, uint256 indexed farmId, string cropType, uint256 quantity, uint256 plantedAt);
    event TransactionRecorded(uint256 indexed txId, address indexed by, string action, uint256 timestamp);

    function addFarm(string memory _owner, string memory _name, string memory _location) public returns (uint256) {
        farmCount++;
        farms[farmCount] = Farm(farmCount, _owner, _name, _location, block.timestamp);
        emit FarmAdded(farmCount, _owner, _name, _location, block.timestamp);
        return farmCount;
    }

    function addCrop(uint256 _farmId, string memory _cropType, uint256 _quantity) public returns (uint256) {
        require(_farmId > 0 && _farmId <= farmCount, "Invalid farm");
        cropCount++;
        crops[cropCount] = Crop(cropCount, _farmId, _cropType, _quantity, block.timestamp);
        emit CropAdded(cropCount, _farmId, _cropType, _quantity, block.timestamp);
        return cropCount;
    }

    // Record a simple textual transaction (e.g., "Sold 10kg wheat to X")
    function recordTransaction(string memory action) public returns (uint256) {
        uint256 txId = block.timestamp; // simple unique-ish id in example
        emit TransactionRecorded(txId, msg.sender, action, block.timestamp);
        return txId;
    }
}
