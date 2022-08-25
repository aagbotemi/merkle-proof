const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address: any, spots: number) {
  // Same as `abi.encodePacked` in Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("Check if merkle root is working", function () {
  it("Should be able to verify if a given address is in whitelist or not", async function () {
  
    // Get a bunch of test addresses
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] =
      await ethers.getSigners();
    
    // Create an array of elements you wish to encode in the Merkle Tree
    const addressList = [
      encodeLeaf(owner.address, 2),
      encodeLeaf(addr1.address, 2),
      encodeLeaf(addr2.address, 2),
      encodeLeaf(addr3.address, 2),
      encodeLeaf(addr4.address, 2),
      encodeLeaf(addr5.address, 2),
      encodeLeaf(addr6.address, 2),
      encodeLeaf(addr7.address, 2),
    ];

    // Create the Merkle Tree using the hashing algorithm `keccak256`
    // Make sure to sort the tree so that it can be produced deterministically regardless
    // of the order of the input list
    const merkleTree = new MerkleTree(addressList, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });
    // Compute the Merkle Root
    const merkleRoot = merkleTree.getHexRoot();

    console.log("Merkle tree: ", merkleTree.toString());
    console.log("Merkle root: ", merkleRoot);

    // Deploy the Whitelist contract
    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(merkleRoot);
    await Whitelist.deployed();

    // Compute the Merkle Proof of the owner address (0'th item in list)
    // off-chain. The leaf node is the hash of that value.
    const leaf = keccak256(addressList[0]);
    const proof = merkleTree.getHexProof(leaf);

    // Provide the Merkle Proof to the contract, and ensure that it can verify
    // that this leaf node was indeed part of the Merkle Tree
    let verifiedList = await Whitelist.checkInWhitelist(proof, 2);
    expect(verifiedList).to.equal(true);

    // Provide an invalid Merkle Proof to the contract, and ensure that
    // it can verify that this leaf node was NOT part of the Merkle Tree
    verifiedList = await Whitelist.checkInWhitelist([], 5);
    expect(verifiedList).to.equal(false);

    // Provide an invalid Merkle Proof to the contract, and ensure that
    // it can verify that this leaf node was NOT part of the Merkle Tree
    verifiedList = await Whitelist.checkInWhitelist([], 2);
    expect(verifiedList).to.equal(false);
  });
});