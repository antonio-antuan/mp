// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Commission {
    uint16 internal constant INCREASE_PRIORITY_MULTIPLIER = 1000;

    function increasePriority() external view returns (uint16) {
        return INCREASE_PRIORITY_MULTIPLIER;
    }
}
