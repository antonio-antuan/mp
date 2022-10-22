pragma solidity ^0.8.0;
import "./Order.sol";

interface IOrders {
    function count() external view returns (uint256);

    function getOrder(uint256 idx) external view returns (Order memory);

    function createOrder(
        address _owner,
        uint256 _reward,
        uint256 _minLockValueInWei,
        string memory _ipfsDetails
    ) external payable returns (Order memory o, uint256 num);

    function becomeCandidate(uint256 idx, address _cand) external payable;

    function cancelBeingCandidate(uint256 idx, address _cand) external;

    function chooseCandidate(uint256 idx, address _addr) external;

    function cancel(uint256 idx) external;

    function approveByExecutor(uint256 idx) external;

    function cancelByExecutor(uint256 idx) external;

    function markAsReady(uint256 idx) external;

    function markAsFailed(uint256 idx) external;

    function markAsCompleted(uint256 idx) external;

    function increasePriority(uint256 idx) external;
}
