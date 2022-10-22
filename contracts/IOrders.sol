pragma solidity ^0.8.0;

import './Order.sol';

interface IOrders {
    function count() external view returns (uint);

    function getOrder(uint idx) external view returns (uint priority,
        uint minLockValueInWei,
        uint reward,
        string memory ipfsDetails,
        address executor,
        OrderState state,
        address owner,
        candidate[] memory candidates);

    function createOrder(address _owner, uint _reward, uint _minLockValueInWei,
        string memory _ipfsDetails) external payable returns (Order memory o, uint num);

    function becomeCandidate(uint idx, address _cand) external payable;

    function cancelBeingCandidate(uint idx, address _cand) external;

    function chooseCandidate(uint idx, address _addr) external;

    function cancel(uint idx) external;

    function approveByExecutor(uint idx) external;

    function cancelByExecutor(uint idx) external;

    function markAsReady(uint idx) external;

    function markAsFailed(uint idx) external;

    function markAsCompleted(uint idx) external;

    function increasePriority(uint idx) external;
}