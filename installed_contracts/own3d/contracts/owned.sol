pragma solidity ^0.4.24;

contract owned {
    address owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyowner {
        require(msg.sender == owner);
        _;
    }
}
