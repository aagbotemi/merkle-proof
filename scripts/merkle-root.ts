import { ethers } from "hardhat";
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address: any, spots: number) {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint64"],
    [address, spots]
  );
}

async function main() {
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] =
    await ethers.getSigners();

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

  const merkleTree = new MerkleTree(addressList, keccak256, {
    hashLeaves: true,
    sortPairs: true,
  });

  const merkleRoot = merkleTree.getHexRoot();

  console.log("Merkle tree: ", merkleTree.toString());
  console.log("Merkle root: ", merkleRoot);

  const Whitelist = await ethers.getContractFactory("Whitelist");
  const whitelist = await Whitelist.deploy(merkleRoot);
  await whitelist.deployed();

  console.log(`Whitelist is deployed to ${whitelist.address}`);

  // const leaf = keccak256(addressList[0]);
  // const proof = merkleTree.getHexProof(leaf);

  // let verifiedList = await whitelist.checkInWhitelist(proof, 2);
  // console.log("VERIFIED LIST: ", verifiedList);

  // let uri =
  //   "https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu";
  // let minted = await whitelist.safeMint(uri, proof, 2);
  // console.log("MINTED NFT: ", minted);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
