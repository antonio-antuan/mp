pragma solidity ^0.8.0;

interface IReputation {
    function measure(
        uint256 createdAt,
        uint256 successRate,
        uint256 manualRate
    ) external view returns (uint256);
}
