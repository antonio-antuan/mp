pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";


import "./Order.sol";
import "./IDoers.sol";
import "./ICommission.sol";
import "./IReputation.sol";
import "./ISet.sol";
import "./IParticipants.sol";

// todo: naming
// todo: reputation
// todo: court
// todo: valid math
contract Mp is Ownable {

    event OrderCreated(uint numberInList);
    event OrderCancelled(uint numberInList);
    event OrderCandidateCreated(uint numberInList);
    event OrderCandidateRejected(uint numberInList);
    event OrderApprovedByExecutor(uint numberInList);
    event OrderCanceledByExecutor(uint numberInList);
    event OrderReady(uint numberInList);
    event OrderFailed(uint numberInList);
    event OrderCompleted(uint numberInList);
    event OrderMetaChanged(uint numberInList);

    Order[] public orders;

    ISet ordersToDo;
    ICommission commissions;
    IParticipants participants;
    IReputation reputation;


    constructor(address _doers, address _set, address _comm, address _irep) {
        participants = IParticipators(_doers);
        ordersToDo = ISet(_set);
        commissions = ICommission(_comm);
        reputation = IReputation(_irep);
        reputation.measure(0,0,0);
    }

    function changeDoersAddress(address _contractAddress) public onlyOwner {
        participants = IParticipators(_contractAddress);
    }

    function changeSetAddress(address _contractAddress) public onlyOwner {
        ordersToDo = ISet(_contractAddress);
    }

    function changeCommissionsAddress(address _contractAddress) public onlyOwner {
        commissions = ICommission(_contractAddress);
    }

    function ordersAmount() public view returns (uint) {
        return orders.length;
    }

    function createOrder(uint lockValueInWei, string memory ipfsDetails) public payable {
        Order o = new Order{value: msg.value}(lockValueInWei, ipfsDetails);
        orders.push(o);
        uint num = orders.length-1;
        ordersToDo.insert(num);
        emit OrderCreated(num);
    }

    function cancelOrder(uint idx) public {
        Order o = getOrder(idx);
        o.cancel();
        ordersToDo.remove(idx);
        emit OrderCancelled(idx);
    }

    function newDoer() public {
        participants.newDoer(msg.sender);
        require(participants.doerIsValid(msg.sender), "invalid doer");
    }

    function becomeCandidate(uint idx) public payable {
        require(participants.doerIsValid(msg.sender), "invalid doer");
        Order o = getOrder(idx);
        o.becomeCandidate{value: msg.value}(msg.sender);
        emit OrderCandidateCreated(idx);
    }

    function increaseOrderPriority(uint idx) public payable {
        Order o = getOrder(idx);
        uint min = minCommissionForPriority(o.priority() + 1);
        require(msg.value >= min, "commission is not enough");
        o.increasePriority();
        emit OrderMetaChanged(idx);
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
        Order o = getOrder(idx);
        o.cancelBeingCandidate(msg.sender);
        emit OrderCandidateRejected(idx);
    }

    function getOrder(uint idx) public view returns (Order) {
        require(idx >= 0, "index of order must be greater than zero");
        require(idx < orders.length, "index of order must be less than orders amount");
        return orders[idx];
    }

    function pendingOrdersOfPriorityCount(uint priority) public view returns (uint) {
        uint res = 0;
        uint[] memory indices = ordersToDo.indices();
        for (uint i = 0; i < indices.length; i++) {
            if (orders[i].priority() == priority) {
                res += 1;
            }
        }
        return res;
    }

    function chooseCandidate(uint idx, address _addr) public {
        Order o = getOrder(idx);
        o.chooseCandidate(_addr);
    }

    function approveByExecutor(uint idx) public {
        Order o = getOrder(idx);
        o.approveByExecutor(msg.sender);
        ordersToDo.remove(idx);
        emit OrderApprovedByExecutor(idx);
    }

    function cancelByExecutor(uint idx) public {
        Order o = getOrder(idx);
        o.cancelByExecutor(msg.sender);
        emit OrderCanceledByExecutor(idx);
    }

    function markAsReady(uint idx) public {
        Order o = getOrder(idx);
        o.markAsReady(msg.sender);
        emit OrderReady(idx);
    }

    function markAsFailed(uint idx) public {
        Order o = getOrder(idx);
        o.markAsFailed(msg.sender);
        participants.changeDoerSuccessRate(o.executor(), false);
        emit OrderFailed(idx);
    }

    function markAsDone(uint idx) public {
        Order o = getOrder(idx);
        o.markAsCompleted();
        participants.changeDoerSuccessRate(o.executor(), true);
        emit OrderCompleted(idx);
    }
}
