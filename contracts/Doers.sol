pragma solidity ^0.8.0;

contract Doers {

    struct Doer {
        address addr;
        int level;
        uint successRate;
    }

    mapping(address => uint) internal addrToIdx;
    Doer[] public doers;

    function newDoer(address _doer) public {
        doers.push(Doer({addr: _doer, level: 0, successRate: 0}));
        addrToIdx[_doer] = doers.length-1;
    }
}
