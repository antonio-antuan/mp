pragma solidity ^0.8.0;

struct Order {
    uint priority;
    uint lockValueInWei;
    uint reward;
    string ipfsDetails;
    address executor;
    OrderState state;

    address owner;
    candidate[] candidates;
}

struct candidate {
    address addr;
    bool notRejected;
    uint lockedValueInWei;
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
