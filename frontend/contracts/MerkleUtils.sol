// contracts/MerkleUtils.sol
pragma solidity ^0.8.20;

library MerkleUtils {
    function verify(bytes32 root, bytes32 leaf, bytes32[] memory proof, uint256 index) internal pure returns (bool) {
        bytes32 computed = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            if ((index & 1) == 1) {
                computed = keccak256(abi.encodePacked(proof[i], computed));
            } else {
                computed = keccak256(abi.encodePacked(computed, proof[i]));
            }
            index >>= 1;
        }
        return computed == root;
    }
}
