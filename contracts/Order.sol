pragma solidity ^0.8.0;

import "./OwnableTxOrigin.sol";


contract Order is OwnableTxOrigin {
    enum OrderState {
        Created,
        Cancelled,
        AwaitingExecutorApproval,
        Accepted,
        Ready,
        Completed,
        Failed
    }

    uint public lockValueInWei;
    uint public reward;
    string public ipfsDetails;
    address public executor;
    OrderState public state;

    error InvalidState(OrderState expected, OrderState actual);

    struct candidate {
        address addr;
        bool notRejected;
        uint lockedValueInWei;
    }

    candidate[] public candidates;
    mapping(address => uint) private candidateAddrToPosition;

    event CandidateChosen(address);

    constructor(uint _lockValueInWei, string memory _ipfsDetails) payable {
        require(msg.value > 0, "reward must be set");
        lockValueInWei = _lockValueInWei;
        ipfsDetails = _ipfsDetails;
        reward = msg.value;
        state = OrderState.Created;
    }

    function becomeCandidate(address _cand) public payable requireState(OrderState.Created) {
        checkOriginIsAddress(_cand);
        require(_cand != owner(), "owner of order can't be a candidate");
        require(msg.value >= lockValueInWei, "value must be greater or equal than order lockValue");
        if (candidates.length > 0) {
            candidate memory pc = candidates[candidateAddrToPosition[_cand]];
            require(pc.addr != _cand || !pc.notRejected, "already a candidate"); // todo: otherwise overwrite candidate?
        }
        candidates.push(candidate({addr: _cand, notRejected: true, lockedValueInWei: msg.value}));
        candidateAddrToPosition[_cand] = candidates.length-1;
    }

    function cancelBeingCandidate(address _cand) public requireState(OrderState.Created) {
        checkOriginIsAddress(_cand);
        candidate storage c = candidates[candidateAddrToPosition[_cand]];
        require(c.addr == _cand, "invalid candidate specified");
        require(c.notRejected, "already rejected");
        c.notRejected = false;
        payable(c.addr).transfer(c.lockedValueInWei);
    }

    function chooseCandidate(address _addr) public onlyOwner requireState(OrderState.Created) {
        for (uint i = 0; i < candidates.length; i++) {
            candidate memory c = candidates[i];
            if (c.addr == _addr) {
                require(executor == address(0), "executor already set");
                executor = _addr;
                state = OrderState.AwaitingExecutorApproval;
                emit CandidateChosen(_addr);
                continue;
            }
            payable(c.addr).transfer(c.lockedValueInWei);
        }
        require(executor == _addr, "candidate with specified address not found");
    }

    function cancel() public onlyOwner requireState(OrderState.Created) {
        state = OrderState.Cancelled;
        payable(owner()).transfer(lockValueInWei);
    }

    modifier requireState(OrderState req) {
        require(state == req, "invalid order state");
        _;
    }

    function checkOriginIsAddress(address _addr) view internal{
        require(_addr == _txOrigin(), "invalid origin of transaction");
    }

    modifier onlyExecutor(address _executor) {
        require(executor == _executor, "only for executor");
        checkOriginIsAddress(_executor);
        _;
    }

    function approveByExecutor(address _executor) public requireState(OrderState.AwaitingExecutorApproval) onlyExecutor(_executor) {
        state = OrderState.Accepted;
    }

    function cancelByExecutor(address _executor) public requireState(OrderState.AwaitingExecutorApproval) onlyExecutor(_executor) {
        state = OrderState.Created;
        executor = address(0);
    }

    function markAsReady(address _executor) public requireState(OrderState.Accepted) onlyExecutor(_executor) {
        state = OrderState.Ready;
    }

    function markAsFailed(address _executor) public requireState(OrderState.Accepted) onlyExecutor(_executor) {
        state = OrderState.Failed;
        candidate memory c = candidates[candidateAddrToPosition[_executor]];
        require(c.addr == _executor, "invalid executor");
        payable(owner()).transfer(c.lockedValueInWei);
    }

    function markAsCompleted() public requireState(OrderState.Ready) onlyOwner {
        state = OrderState.Completed;
        payable(executor).transfer(reward);
    }
}
