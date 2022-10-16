// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Commission {
    uint constant increasePriorityMultiplier  = 1000;

    function increasePriority() external view returns (uint) {
        return increasePriorityMultiplier;
    }
}
