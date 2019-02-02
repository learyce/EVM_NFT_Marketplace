pragma solidity ^0.4.24;
import "./StoreOwners.sol";


contract StoreFactory is StoreOwners {
    
    struct Store {
        bool exists;
        uint balance;
    }
    
    Store[] public stores;

    mapping(uint => address) public storeToOwner;
    
    modifier ownerOf(uint _storeId) {
        require(_storeId >= 0);
        require(storeToOwner[_storeId] == msg.sender);
        require(stores[_storeId].exists == true);
        _;
    }

    event LogNewStore(uint _storeId);

    function getStore(uint _storeId) public view returns (bool, uint) {
        require(_storeId >= 0);
        require(_storeId < stores.length);
        Store memory _store = stores[_storeId];

        return (_store.exists, _store.balance);
    }

    function createStore() public storeOwnersOnly onlyWhenNotStopped {
        Store memory newStore = Store(true, 0);

        uint _id = stores.push(newStore) - 1;
        storeToOwner[_id] = msg.sender;
        emit LogNewStore(_id);
    }
}
