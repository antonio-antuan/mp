pragma solidity ^0.8.0;

// todo: doers is an interface. court, doer, (customer?)... doer categories?
contract Participants {

    // maybe Doer is a contract?
    struct Doer {
        address addr;
        int level;
        uint successOrders;
        uint failedOrders;
        uint registerDate;
    }


    mapping(address => uint) internal addrToIdx;
    Doer[] public doers;

    function newDoer(address _doer) external {
        if (doers.length > 0) {
            require(doers[addrToIdx[_doer]].addr != _doer, "doer already exists");
        }
        doers.push(Doer({addr: _doer, level: 0, successOrders: 0, failedOrders:0, registerDate: block.timestamp}));
        addrToIdx[_doer] = doers.length-1;
    }

    function getDoerByAddress(address _addr) internal view returns (Doer storage) {
        Doer storage d = doers[addrToIdx[_addr]];
        require(d.addr == _addr, "invalid doer");
        return d;
    }

    function changeDoerSuccessRate(address _addr, bool success) public {
        Doer storage d = getDoerByAddress(_addr);
        if (success) {
            d.successOrders += 1;
        } else {
            d.failedOrders += 1;
        }
    }

    function getSuccessRate() external view returns (uint) {
        // todo
        return 0;
    }

    function doerIsValid(address _doer) public view returns (bool) {
        return doers[addrToIdx[_doer]].addr == _doer;
    }
}
