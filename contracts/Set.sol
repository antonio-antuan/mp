// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Set {
    mapping(uint256 => uint256) private pointers;
    uint256[] private list;

    function insert(uint256 key) public {
        require(!exists(key), "key already exists");
        list.push(key);
        pointers[key] = list.length - 1;
    }

    function remove(uint256 key) public {
        require(exists(key), "key does not exist in the set.");
        uint256 keyToMove = list[list.length - 1];
        uint256 rowToReplace = pointers[key];
        pointers[keyToMove] = rowToReplace;
        list[rowToReplace] = keyToMove;
        delete pointers[key];
        list.pop();
    }

    function exists(uint256 key) internal view returns (bool) {
        if (list.length == 0) return false;
        return list[pointers[key]] == key;
    }

    function indices() public view returns (uint256[] memory) {
        return list;
    }
}
