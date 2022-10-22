pragma solidity ^0.8.0;

contract Reputation {
    function measure(
        uint256 createdAt,
        uint256 successRate,
        uint256 manualRate
    ) external view returns (uint256) {
        return (block.timestamp - createdAt) * successRate * manualRate;
    }
}
