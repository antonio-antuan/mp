// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Commission {
    uint8 internal constant INCREASE_PRIORITY_MULTIPLIER = 1000;

    function increasePriority() external view returns (uint8) {
        return increasePriorityMultiplier;
    }
}
