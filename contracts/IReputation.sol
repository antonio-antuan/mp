pragma solidity ^0.8.0;

interface IReputation {
    function measure(uint createdAt, uint successRate, uint manualRate) external view returns (uint);
}