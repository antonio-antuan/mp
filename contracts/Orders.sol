pragma solidity ^0.8.0;

import "./Order.sol";

contract Orders {

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

    mapping(uint => mapping(address => uint)) candidateAddrToPosition;

    event CandidateChosen(address);
    error InvalidState(OrderState expected, OrderState actual);

    function createOrder(
        address _owner,
        uint _reward,
        uint _minLockValueInWei,
        string memory _ipfsDetails
    ) external payable returns (Order memory, uint){
        require(msg.value > 0, "reward must be set");
        uint num = orders.length;
        Order storage o = orders.push();
        o.lockValueInWei = _minLockValueInWei;
        o.reward = msg.value;
        o.ipfsDetails = _ipfsDetails;
        o.state = OrderState.Created;
        o.owner = _owner;
        emit OrderCreated(num);
        return (o, num);
    }

    function count() public view returns (uint) {
        return orders.length;
    }

    function getOrder(uint idx) public returns (uint priority,
        uint minLockValueInWei,
        uint reward,
        string memory ipfsDetails,
        address executor,
        OrderState state,
        address owner,
        candidate[] memory candidates) {
        require(idx >= 0, "index of order must be greater than zero");
        require(idx < orders.length, "index of order must be less than orders amount");
        Order memory o = orders[idx];
        return (o.priority, o.lockValueInWei, o.reward, o.ipfsDetails, o.executor, o.state, o.owner, o.candidates);
    }

    function becomeCandidate(uint idx, address _cand) public payable {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        require(_cand != o.owner, "owner of order can't be a candidate");
        require(msg.value >= o.lockValueInWei, "value must be greater or equal than order lockValue");
        if (o.candidates.length > 0) {
            candidate memory pc = o.candidates[candidateAddrToPosition[idx][_cand]];
            require(pc.addr != _cand || !pc.notRejected, "already a candidate"); // todo: otherwise overwrite candidate?
        }
        o.candidates.push(candidate({addr: _cand, notRejected: true, lockedValueInWei: msg.value}));
        candidateAddrToPosition[idx][_cand] = o.candidates.length-1;
    }

    function cancelBeingCandidate(uint idx, address _cand) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        candidate storage c = o.candidates[candidateAddrToPosition[idx][_cand]];
        require(c.addr == _cand, "invalid candidate specified");
        require(c.notRejected, "already rejected");
        c.notRejected = false;
        payable(c.addr).transfer(c.lockedValueInWei);
    }

    function chooseCandidate(uint idx, address _addr) public {
        Order storage o = orders[idx];
        require(tx.origin == o.owner, "not an owner of the order");
        require(o.state == OrderState.Created, "invalid order state");
        for (uint i = 0; i < o.candidates.length; i++) {
            candidate memory c = o.candidates[i];
            if (c.addr == _addr) {
                require(o.executor == address(0), "executor already set");
                o.executor = _addr;
                o.state = OrderState.AwaitingExecutorApproval;
                emit CandidateChosen(_addr);
                continue;
            }
            // todo: transfer only when approved by chosen candidate
            payable(c.addr).transfer(c.lockedValueInWei);
        }
        require(o.executor == _addr, "candidate with specified address not found");
    }

    function cancel(uint idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        require(tx.origin == o.owner, "invalid owner of an order");
        o.state = OrderState.Cancelled;
        payable(o.owner).transfer(o.reward);
    }

    function approveByExecutor(uint idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.AwaitingExecutorApproval, "invalid order state");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Accepted;
    }

    function cancelByExecutor(uint idx) public {
        Order storage o = orders[idx];
        o.state = OrderState.Created;
        require(o.state == OrderState.AwaitingExecutorApproval, "invalid order state");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.executor = address(0);
    }

    function markAsReady(uint idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Accepted, "invalid order state");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Ready;
    }

    function markAsFailed(uint idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Accepted, "invalid order state");
        candidate memory c = o.candidates[candidateAddrToPosition[idx][o.executor]];
        require(c.addr == o.executor, "invalid executor");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Failed;
        payable(o.owner).transfer(c.lockedValueInWei);
    }

    function markAsCompleted(uint idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Ready, "invalid order state");
        require(tx.origin == o.owner, "invalid owner of an order");
        o.state = OrderState.Completed;
        payable(o.executor).transfer(o.reward);
    }

    function increasePriority(uint idx) public {
        Order storage o = orders[idx];
        require(tx.origin == o.owner, "invalid owner of an order");
        o.priority += 1;
    }

}