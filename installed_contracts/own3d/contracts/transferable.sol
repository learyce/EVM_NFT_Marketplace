pragma solidity ^0.4.24;

import {owned} from "./owned.sol";


contract transferable is owned {
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    function transferOwnership(address newOwner) public onlyowner {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}

