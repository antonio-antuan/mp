pragma solidity ^0.8.0;

import "./OwnableTxOrigin.sol";


contract Order is OwnableTxOrigin {
    enum OrderState {
        Created,
        Cancelled,
        AwaitingExecutorApproval,
        Accepted,
        Completed,
        Failed
    }

    uint public lockValue;
    uint public reward;
    string public ipfsDetails;
    address public executor;
    OrderState public state;

    error InvalidState(OrderState expected, OrderState actual);

    struct candidate {
        address addr;
        bool notRejected;
    }

    candidate[] public candidates;
    mapping(address => uint) private candidateAddrToPosition;

    event CandidateChosen(address);

    constructor(uint _lockValue, string memory _ipfsDetails) payable {
        require(msg.value > 0, "reward must be set");
        lockValue = _lockValue;
        ipfsDetails = _ipfsDetails;
        reward = msg.value;
        state = OrderState.Created;
    }

    function becomeCandidate(address _cand) public payable requireState(OrderState.Created) {
        require(msg.value >= lockValue, "value must be greater or equal than order lockValue");
        candidates.push(candidate({addr: _cand, notRejected: true}));
        candidateAddrToPosition[_cand] = candidates.length-1;
    }

    function cancelBeingCandidate(address _cand) public requireState(OrderState.Created) {
        candidate storage c = candidates[candidateAddrToPosition[_cand]];
        require(c.addr == _cand, "invalid candidate specified");
        require(c.notRejected, "already rejected");
        c.notRejected = false;
        payable(c.addr).transfer(lockValue);
    }

    function chooseCandidate(address _addr) public onlyOwner requireState(OrderState.Created) {
        for (uint i = 0; i <= candidates.length; i++) {
            candidate memory c = candidates[i];
            if (c.addr == _addr) {
                require(executor == address(0), "executor already set");
                executor = _addr;
                state = OrderState.AwaitingExecutorApproval;
                emit CandidateChosen(_addr);
                break;
            }
            payable(_addr).transfer(lockValue);
        }
        require(executor == address(0), "candidate with specified not found");
    }

    function cancel() public onlyOwner requireState(OrderState.Created) {
        state = OrderState.Cancelled;
        payable(owner()).transfer(lockValue);
    }

    modifier requireState(OrderState req) {
        if (state != req) {
            revert InvalidState(req, state);
        }
        _;
    }
}
