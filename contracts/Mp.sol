pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import './Order.sol';

import "./IParticipants.sol";
import "./ICommission.sol";
import "./IReputation.sol";
import "./ISet.sol";
import "./IOrders.sol";

// todo: naming
// todo: reputation
// todo: court
// todo: valid math
contract Mp is Ownable {

    ISet ordersToDo;
    ICommission commissions;
    IParticipants participants;
    IReputation reputation;
    IOrders orders;

    constructor(address _participants, address _set, address _comm, address _irep, address _orders) {
        participants = IParticipants(_participants);
        ordersToDo = ISet(_set);
        commissions = ICommission(_comm);
        reputation = IReputation(_irep);
        orders = IOrders(_orders);
    }

    function changeDoersAddress(address _contractAddress) public onlyOwner {
        participants = IParticipants(_contractAddress);
    }

    function changeOrdersAddress(address _ordersAddress) public onlyOwner {
        orders = IOrders(_ordersAddress);
    }

    function changeSetAddress(address _contractAddress) public onlyOwner {
        ordersToDo = ISet(_contractAddress);
    }

    function changeCommissionsAddress(address _contractAddress) public onlyOwner {
        commissions = ICommission(_contractAddress);
    }

    function ordersCount() public view returns (uint) {
        return orders.count();
    }

    function getPendingOrdersBatch(uint8 limit, uint8 offset) public view returns (uint[] memory ) {
        uint[] memory indices = ordersToDo.indices();
        uint from = limit * offset;
        uint[] memory res = new uint256[](limit);
        for (uint i = from; i < from + limit; i++) {
            res[res.length] = indices[i];
        }
        return res;
    }

    function createOrder(uint lockValueInWei, string memory ipfsDetails) public payable {
        uint num;
        (, num) = orders.createOrder{value: msg.value}(tx.origin, msg.value, lockValueInWei, ipfsDetails);
        ordersToDo.insert(num);
    }

    function cancelOrder(uint idx) public {
        orders.cancel(idx);
        ordersToDo.remove(idx);
    }

    function newDoer() public {
        participants.newDoer(msg.sender);
        require(participants.doerIsValid(msg.sender), "invalid doer");
    }

    function becomeCandidate(uint idx) public payable {
        require(participants.doerIsValid(msg.sender), "invalid doer");
        orders.becomeCandidate{value: msg.value}(idx, msg.sender);
    }

    function increaseOrderPriority(uint idx) public payable {
        uint priority;
        (priority,,,,,,,) = orders.getOrder(idx);
        uint min = minCommissionForPriority(priority + 1);
        require(msg.value >= min, "commission is not enough");
        orders.increasePriority(idx);
    }

    function minCommissionForPriority(uint prior) public view returns (uint) {
        // todo: commision has to be measured depending on the new order's position in global list
        uint pendingOrdersAmount = pendingOrdersOfPriorityCount(prior);
        if (pendingOrdersAmount == 0) {
            pendingOrdersAmount = 1;
        }
        return (1*commissions.increasePriority())/pendingOrdersAmount;
    }

    function cancelBeingCandidate(uint idx) public payable {
        orders.cancelBeingCandidate(idx, msg.sender);
    }

    function getOrder(uint idx) public view returns (uint priority,
        uint minLockValueInWei,
        uint reward,
        string memory ipfsDetails,
        address executor,
        OrderState state,
        address owner,
        candidate[] memory candidates) {
        return orders.getOrder(idx);
    }

    function pendingOrdersOfPriorityCount(uint priority) public view returns (uint) {
        uint res = 0;
        uint[] memory indices = ordersToDo.indices();
        for (uint i = 0; i < indices.length; i++) {
            uint priority;
            (priority,,,,,,,) = orders.getOrder(indices[i]);
            if (priority == priority) {
                res += 1;
            }
        }
        return res;
    }

    function chooseCandidate(uint idx, address _addr) public {
        orders.chooseCandidate(idx, _addr);
    }

    function approveByExecutor(uint idx) public {
        orders.approveByExecutor(idx);
        ordersToDo.remove(idx);
    }

    function cancelByExecutor(uint idx) public {
        orders.cancelByExecutor(idx);
    }

    function markAsReady(uint idx) public {
        orders.markAsReady(idx);
    }

    function markAsFailed(uint idx) public {
        orders.markAsFailed(idx);
        address executor;
        (,,,,executor,,,) = orders.getOrder(idx);
        participants.changeDoerSuccessRate(executor, false);
    }

    function markAsDone(uint idx) public {
        orders.markAsCompleted(idx);
        address executor;
        (,,,,executor,,,) = orders.getOrder(idx);
        participants.changeDoerSuccessRate(executor, true);
    }
}
