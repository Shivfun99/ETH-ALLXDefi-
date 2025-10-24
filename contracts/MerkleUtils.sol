// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library MerkleUtils {
    function verifyLeaf(bytes32 leaf, bytes32 root, bytes32[] memory proof) internal pure returns (bool) {
        bytes32 computed = leaf;
        for (uint i = 0; i < proof.length; i++) {
            computed = keccak256(abi.encodePacked(computed, proof[i]));
        }
        return computed == root;
    }
}
