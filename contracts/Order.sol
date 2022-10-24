pragma solidity ^0.8.0;

struct Order {
    uint256 position;
    uint256 priority;
    uint256 lockValueInWei;
    uint256 reward;
    string ipfsDetails;
    address executor;
    OrderState state;
    address owner;
    Candidate[] candidates;
}

struct Candidate {
    address addr;
    bool notRejected;
    uint256 lockedValueInWei;
}

enum OrderState {
    Created,
    Cancelled,
    AwaitingExecutorApproval,
    Accepted,
    Ready,
    Completed,
    Failed
}
