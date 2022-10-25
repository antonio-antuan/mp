pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

import "./Order.sol";

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
    ISet internal ordersToDo;
    ICommission public commissions;
    IParticipants public participants;
    IReputation public reputation;
    IOrders public orders;

    constructor(
        address _participants,
        address _set,
        address _comm,
        address _irep,
        address _orders
    ) {
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

    function changeCommissionsAddress(address _contractAddress)
        public
        onlyOwner
    {
        commissions = ICommission(_contractAddress);
    }

    function ordersCount() public view returns (uint256) {
        return orders.count();
    }

    function getPendingOrdersBatch(uint8 limit, uint8 offset)
        public
        view
        returns (uint256[] memory)
    {
        console.log("limit", limit);
        console.log("offset", offset);
        if (limit == 0) {
            return new uint256[](0);
        }

        uint256[] memory indices = ordersToDo.indices();
        if (indices.length == 0 || offset > indices.length-1) {
            return new uint256[](0);
        }

        uint256 to = offset+limit;
        if (to > indices.length) {
            to = indices.length;
        }

        uint256[] memory res = new uint256[](to-offset);

        uint16 x = 0;
        console.log("to", to);
        console.log("len", indices.length);
        for (uint256 i = offset; i < to; i++) {
            res[x] = indices[i];
            x++;
        }
        return res;
    }

    function createOrder(uint256 lockValueInWei, string memory ipfsDetails)
        public
        payable
    {
        uint256 num;
        (, num) = orders.createOrder{value: msg.value}(
            tx.origin,
            msg.value,
            lockValueInWei,
            ipfsDetails
        );
        ordersToDo.insert(num);
    }

    function cancelOrder(uint256 idx) public {
        orders.cancel(idx);
        ordersToDo.remove(idx);
    }

    function newDoer() public {
        participants.newDoer(msg.sender);
        require(participants.doerIsValid(msg.sender), "invalid doer");
    }

    function becomeCandidate(uint256 idx) public payable {
        require(participants.doerIsValid(msg.sender), "invalid doer");
        orders.becomeCandidate{value: msg.value}(idx, msg.sender);
    }

    function increaseOrderPriority(uint256 idx) public payable {
        Order memory o = orders.getOrder(idx);
        uint256 min = minCommissionForPriority(o.priority + 1);
        require(msg.value >= min, "commission is not enough");
        orders.increasePriority(idx);
    }

    function minCommissionForPriority(uint256 prior)
        public
        view
        returns (uint256)
    {
        // todo: commision has to be measured depending on the new order's position in global list
        uint256 pendingOrdersAmount = pendingOrdersOfPriorityCount(prior);
        if (pendingOrdersAmount == 0) {
            pendingOrdersAmount = 1;
        }
        return (1 * commissions.increasePriority()) / pendingOrdersAmount;
    }

    function cancelBeingCandidate(uint256 idx) public payable {
        orders.cancelBeingCandidate(idx, msg.sender);
    }

    function getOrder(uint256 idx) public view returns (Order memory) {
        return orders.getOrder(idx);
    }

    function pendingOrdersOfPriorityCount(uint256 priority)
        public
        view
        returns (uint256)
    {
        uint256 res = 0;
        uint256[] memory indices = ordersToDo.indices();
        for (uint256 i = 0; i < indices.length; i++) {
            if (orders.getOrder(indices[i]).priority == priority) {
                res += 1;
            }
        }
        return res;
    }

    function chooseCandidate(uint256 idx, address _addr) public {
        orders.chooseCandidate(idx, _addr);
    }

    function approveByExecutor(uint256 idx) public {
        orders.approveByExecutor(idx);
        ordersToDo.remove(idx);
    }

    function cancelByExecutor(uint256 idx) public {
        orders.cancelByExecutor(idx);
    }

    function markAsReady(uint256 idx) public {
        orders.markAsReady(idx);
    }

    function markAsFailed(uint256 idx) public {
        orders.markAsFailed(idx);
        Order memory o = orders.getOrder(idx);
        participants.changeDoerSuccessRate(o.executor, false);
    }

    function markAsDone(uint256 idx) public {
        orders.markAsCompleted(idx);
        Order memory o = orders.getOrder(idx);
        participants.changeDoerSuccessRate(o.executor, true);
    }
}
