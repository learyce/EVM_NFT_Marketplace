pragma solidity ^0.4.24;
import "./ProductFactory.sol";


contract Storefront is ProductFactory {
    
    event LogWithdrawl(uint _storeId);

    function getAllProductsByStore(uint _storeId) external view returns(uint[]) {
        require(stores[_storeId].exists == true); //Store exists and is open
        
        uint[] memory _ids = new uint[](storeToProducts[_storeId].length);

        for (uint i = 0; i < storeToProducts[_storeId].length; i++) {
            _ids[i] = i;
        }
        return _ids;
    }

    function getAllStores() external view returns(uint[]) {
        uint[] memory _ids = new uint[](stores.length);

        for (uint i = 0; i < stores.length; i++) {
            _ids[i] = i;
        }
        return _ids;
    }

    function getAllReceiptsByCustomer(address _address) external view returns (uint[]) {
        uint[] memory _ids = new uint[](customerToReceipts[_address].length);

        for (uint i = 0; i < customerToReceipts[_address].length; i++) {
            _ids[i] = i;
        }
        return _ids;
    }

    function withdraw(uint _storeId) public ownerOf(_storeId) onlyWhenNotStopped {
        require(storeToOwner[_storeId].balance > 0);

        address _storeOwner = storeToOwner[_storeId];
        uint _storeBalance = stores[_storeId].balance;
        stores[_storeId].balance = 0;

        _storeOwner.transfer(_storeBalance);
        
        emit LogWithdrawl(_storeId);
    }

    // Fallback function - Called if other functions don't match call or
    // sent ether without data
    // Typically, called when invalid data is sent
    // Added so ether sent to this contract is reverted if the contract fails
    // otherwise, the sender's money is transferred to contract
    function() public {
        revert();
    }
}