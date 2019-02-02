pragma solidity ^0.4.24;

import "./Administrators.sol";


contract StoreOwners is Administrators {
    mapping(address => bool) public storeOwners;

    event LogNewStoreOwner(address _address);
    event LogRemovedStoreOwner(address _address);

    modifier storeOwnersOnly() {
        require(storeOwners[msg.sender] == true);
        _;
    }

    constructor() public {
        /* Add the contract creator to the storeOwners */
        storeOwners[msg.sender] = true;
    }

    function addStoreOwner(address _address) public administratorsOnly onlyWhenNotStopped {
        require(storeOwners[_address] == false);
        storeOwners[_address] = true;
        emit LogNewStoreOwner(_address);
    }

    function removeStoreOwner(address _address) public administratorsOnly onlyWhenNotStopped {
        require(storeOwners[_address] == true);
        storeOwners[_address] = false;
        emit LogRemovedStoreOwner(_address);
    }
}