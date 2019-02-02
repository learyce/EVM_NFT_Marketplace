pragma solidity ^0.4.24;


import "own3d/owned.sol";


contract Administrators is owned {
    mapping(address => bool) public administrators;

    bool isStopped = false;

    event LogNewAdmin(address _address);
    event LogRemovedAdmin(address _address);

    modifier administratorsOnly() {
        require(administrators[msg.sender] == true);
        _;
    }
    
    modifier onlyWhenNotStopped {
        require(isStopped == false);
        _;
    }

    constructor() public {
        /* Add the contract creator to the admin */
        administrators[msg.sender] = true;
    }

    function getOwner() external view returns(address) {
        return owner;
    }

    function addAdmin(address _address) public onlyowner onlyWhenNotStopped {
        require(administrators[_address] == false);
        administrators[_address] = true;
        emit LogNewAdmin(_address);
    }

    function removeAdmin(address _address) public onlyowner onlyWhenNotStopped {
        require(administrators[_address] == true);
        administrators[_address] = false;
        emit LogRemovedAdmin(_address);
    }

    function stopContract() public onlyowner {
        isStopped = true;
    }

    function resumeContract() public onlyowner {
        isStopped = false;
    }
}