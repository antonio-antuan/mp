pragma solidity ^0.8.0;

interface ISet {
    function insert(uint256) external;

    function remove(uint256) external;

    function indices() external view returns (uint256[] memory);
}
