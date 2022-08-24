// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist {

    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) external view returns (bool verified) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowanceToMint));
        verified = MerkleProof.verify(proof, merkleRoot, leaf);
    }
}