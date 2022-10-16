// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Set {

    mapping(uint => uint) private pointers;
    uint[] private list;

    function insert(uint key) public {
        require(!exists(key), "key already exists");
        list.push(key);
        pointers[key] = list.length - 1;
    }

    function remove(uint key) public {
        require(exists(key), "key does not exist in the set.");
        uint keyToMove = list[list.length-1];
        uint rowToReplace = pointers[key];
        pointers[keyToMove] = rowToReplace;
        list[rowToReplace] = keyToMove;
        delete pointers[key];
        list.pop();
    }

    function exists(uint key) internal view returns(bool) {
        if(list.length == 0) return false;
        return list[pointers[key]] == key;
    }

    function indices() public view returns( uint[] memory) {
        return list;
    }

}