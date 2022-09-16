pragma solidity ^0.8.0;


import "./Order.sol";

contract Mp {

    event OrderCreated(uint numberInList);
    event OrderCancelled(uint numberInList);
    event OrderCandidateCreated(uint numberInList);
    event OrderCandidateRejected(uint numberInList);

    Order[] public orders;

    function ordersAmount() public view returns (uint) {
        return orders.length;
    }

    function createOrder(uint lockValueInWei, string memory ipfsDetails) public payable {
        Order o = new Order{value: msg.value}(lockValueInWei, ipfsDetails);
        orders.push(o);
        emit OrderCreated(orders.length-1);
    }

    function cancelOrder(uint idx) public {
        Order o = getOrder(idx);
        o.cancel();
        emit OrderCancelled(idx);
    }

    function becomeCandidate(uint idx) public payable {
        Order o = getOrder(idx);
        o.becomeCandidate{value: msg.value}(msg.sender);
        emit OrderCandidateCreated(idx);
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

    function chooseCandidate(uint idx, address _addr) public {
        Order o = getOrder(idx);
        o.chooseCandidate(_addr);
    }

}
