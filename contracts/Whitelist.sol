// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Whitelist is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _myCounter;

    bytes32 public merkleRoot;
    uint256 MAX_SUPPLY = 20;

    mapping(address => uint) whitelistClaimed;

    constructor(bytes32 _merkleRoot) ERC721("AbiodunAwoyemi", "AA")  {
        merkleRoot = _merkleRoot;
    }

    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) public view returns (bool verified) {
        require(!whitelistClaimed[msg.sender] >= maxAllowanceToMint, "You've already minted maximum number of NFT!");
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowanceToMint));
        verified = MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function safeMint(string memory uri, bytes32[] calldata _merkleProof, uint64 maxAllowanceToMint) external {

        bool status = checkInWhitelist(_merkleProof, maxAllowanceToMint);

        require(status, "Invalid Proof");

        uint256 tokenId = _myCounter.current();
        require(tokenId <= MAX_SUPPLY, "Sorry, all NFTs have been minted!");
        _myCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        whitelistClaimed[msg.sender]++;
    }
}
