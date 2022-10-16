pragma solidity ^0.8.0;

interface ISet {
    function insert(uint) external;
    function remove(uint) external;
    function indices() external view returns( uint[] memory);
}