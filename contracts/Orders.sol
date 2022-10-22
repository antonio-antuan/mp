pragma solidity ^0.8.0;

import "./Order.sol";

contract Orders {
    event OrderCreated(uint256 numberInList);
    event OrderCancelled(uint256 numberInList);
    event OrderCandidateCreated(uint256 numberInList);
    event OrderCandidateRejected(uint256 numberInList);
    event OrderApprovedByExecutor(uint256 numberInList);
    event OrderCanceledByExecutor(uint256 numberInList);
    event OrderReady(uint256 numberInList);
    event OrderFailed(uint256 numberInList);
    event OrderCompleted(uint256 numberInList);
    event OrderMetaChanged(uint256 numberInList);

    Order[] public orders;

    mapping(uint256 => mapping(address => uint256))
        internal candidateAddrToPosition;

    event CandidateChosen(address);
    error InvalidState(OrderState expected, OrderState actual);

    function createOrder(
        address _owner,
        uint256 _reward,
        uint256 _minLockValueInWei,
        string memory _ipfsDetails
    ) external payable returns (Order memory, uint256) {
        require(msg.value > 0, "reward must be set");
        uint256 num = orders.length;
        Order storage o = orders.push();
        o.lockValueInWei = _minLockValueInWei;
        o.reward = msg.value;
        o.ipfsDetails = _ipfsDetails;
        o.state = OrderState.Created;
        o.reward = _reward;
        o.owner = _owner;
        emit OrderCreated(num);
        return (o, num);
    }

    function count() public view returns (uint256) {
        return orders.length;
    }

    function getOrder(uint256 idx) public returns (Order memory) {
        require(idx >= 0, "index of order must be greater than zero");
        require(
            idx < orders.length,
            "index of order must be less than orders amount"
        );
        return orders[idx];
    }

    function becomeCandidate(uint256 idx, address _cand) public payable {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        require(_cand != o.owner, "owner of order can't be a candidate");
        require(
            msg.value >= o.lockValueInWei,
            "value must be greater or equal than order lockValue"
        );
        if (o.candidates.length > 0) {
            Candidate memory pc = o.candidates[
                candidateAddrToPosition[idx][_cand]
            ];
            require(pc.addr != _cand || !pc.notRejected, "already a candidate"); // todo: otherwise overwrite candidate?
        }
        o.candidates.push(
            Candidate({
                addr: _cand,
                notRejected: true,
                lockedValueInWei: msg.value
            })
        );
        candidateAddrToPosition[idx][_cand] = o.candidates.length - 1;
    }

    function cancelBeingCandidate(uint256 idx, address _cand) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        Candidate storage c = o.candidates[candidateAddrToPosition[idx][_cand]];
        require(c.addr == _cand, "invalid candidate specified");
        require(c.notRejected, "already rejected");
        c.notRejected = false;
        payable(c.addr).transfer(c.lockedValueInWei);
    }

    function chooseCandidate(uint256 idx, address _addr) public {
        Order storage o = orders[idx];
        require(tx.origin == o.owner, "not an owner of the order");
        require(o.state == OrderState.Created, "invalid order state");
        for (uint256 i = 0; i < o.candidates.length; i++) {
            Candidate memory c = o.candidates[i];
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
        require(
            o.executor == _addr,
            "candidate with specified address not found"
        );
    }

    function cancel(uint256 idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Created, "invalid order state");
        require(tx.origin == o.owner, "invalid owner of an order");
        o.state = OrderState.Cancelled;
        payable(o.owner).transfer(o.reward);
    }

    function approveByExecutor(uint256 idx) public {
        Order storage o = orders[idx];
        require(
            o.state == OrderState.AwaitingExecutorApproval,
            "invalid order state"
        );
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Accepted;
    }

    function cancelByExecutor(uint256 idx) public {
        Order storage o = orders[idx];
        require(
            o.state == OrderState.AwaitingExecutorApproval,
            "invalid order state"
        );
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Created;
        o.executor = address(0);
    }

    function markAsReady(uint256 idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Accepted, "invalid order state");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Ready;
    }

    function markAsFailed(uint256 idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Accepted, "invalid order state");
        Candidate memory c = o.candidates[
            candidateAddrToPosition[idx][o.executor]
        ];
        require(c.addr == o.executor, "invalid executor");
        require(tx.origin == o.executor, "invalid executor of an order");
        o.state = OrderState.Failed;
        payable(o.owner).transfer(c.lockedValueInWei);
    }

    function markAsCompleted(uint256 idx) public {
        Order storage o = orders[idx];
        require(o.state == OrderState.Ready, "invalid order state");
        require(tx.origin == o.owner, "invalid owner of an order");
        o.state = OrderState.Completed;
        payable(o.executor).transfer(o.reward);
    }

    function increasePriority(uint256 idx) public {
        Order storage o = orders[idx];
        require(tx.origin == o.owner, "invalid owner of an order");
        o.priority += 1;
    }
}
