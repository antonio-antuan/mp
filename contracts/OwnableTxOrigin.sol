pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableTxOrigin is Ownable {
    constructor() {
        _transferOwnership(_txOrigin());
    }

    function _txOrigin() internal view virtual returns (address) {
        return tx.origin;
    }

    function _checkOwner() override internal view virtual {
        require(owner() == _txOrigin(), "Ownable: caller is not the owner");
    }
}
