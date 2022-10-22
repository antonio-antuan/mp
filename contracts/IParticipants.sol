pragma solidity ^0.8.0;

interface IParticipants {
    function doerIsValid(address _doer) external view returns (bool);

    function newDoer(address _doer) external;

    function changeDoerSuccessRate(address _addr, bool success) external;
}
