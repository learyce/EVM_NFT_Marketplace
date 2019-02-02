pragma solidity ^0.4.24;
import "./StoreFactory.sol";


contract ProductFactory is StoreFactory {

    struct Product {
        uint price;
        uint quantity;
        bool exists;
    }

    struct Receipt {
        bool exists;
        uint storeId;
        uint productId;
        uint pricePerProduct;
        uint blockNumber;
    }

    mapping(uint => Product[]) public storeToProducts;
    mapping(address => Receipt[]) public customerToReceipts;

    modifier validProduct(uint _price, uint _quantity) {
        require(_price >= 0);
        require(_quantity >= 0); 
        _;
    }

    /* modifier checkValue(uint _sku) {
        _;
        uint _price = items[_sku].price;
        uint amountToRefund = msg.value - _price;
        items[_sku].buyer.transfer(amountToRefund);
    } 
    */
    event LogNewProduct(uint _storeId, uint _productId);
    event LogProductUpdate(uint _storeId, uint _productId);
    event LogProductPurchase(uint _storeId, uint _productId, uint _receiptId, address _address);

    function getProduct(uint _storeId, uint _productId) external view returns(uint _price, uint _quantity) {
        require(stores[_storeId].exists == true); //Store exists and is open
        require(storeToProducts[_storeId][_productId].exists == true); //Product exists in the store.

        _price = storeToProducts[_storeId][_productId].price;
        _quantity = storeToProducts[_storeId][_productId].quantity;
        return;
    }

    function getReceipt(address _address, uint _receiptId) external view 
    returns(uint _storeId, uint _productId, uint _pricePerProduct, uint _blockNumber) {

        require(customerToReceipts[_address][_receiptId].exists == true); 

        _storeId = customerToReceipts[_address][_receiptId].storeId;
        _productId = customerToReceipts[_address][_receiptId].productId;
        _pricePerProduct = customerToReceipts[_address][_receiptId].pricePerProduct;
        _blockNumber = customerToReceipts[_address][_receiptId].blockNumber;
        return;
    }

    function addProduct(uint _storeId, uint _price, uint _quantity)
    public ownerOf(_storeId) validProduct(_price, _quantity) onlyWhenNotStopped {
        Product memory _newProduct = Product(_price, _quantity, true);
        uint _productId = storeToProducts[_storeId].push(_newProduct) - 1;
        
        emit LogNewProduct(_storeId, _productId);
    }

    function editProduct(uint _storeId, uint _productId, uint _newPrice, uint _newQuantity) 
    public ownerOf(_storeId) validProduct(_newPrice, _newQuantity) onlyWhenNotStopped {

        require(storeToProducts[_storeId][_productId].exists == true);

        Product storage _product = storeToProducts[_storeId][_productId];
        _product.price = _newPrice;
        _product.quantity = _newQuantity;

        emit LogProductUpdate(_storeId, _productId);
    }

    function buyProduct(uint _storeId, uint _productId) public payable onlyWhenNotStopped {
        require(stores[_storeId].exists == true); //Store exists and is open
        require(storeToProducts[_storeId][_productId].exists == true); //Product exists in the store.
        require(storeToProducts[_storeId][_productId].quantity > 0);
        require(storeToProducts[_storeId][_productId].price == msg.value);

        Receipt memory _receipt = Receipt(true, _storeId, _productId, 
                                        storeToProducts[_storeId][_productId].price, block.number);

        uint _receiptId = customerToReceipts[msg.sender].push(_receipt);
        storeToProducts[_storeId][_productId].quantity--;
        stores[_storeId].balance += msg.value;

        emit LogProductPurchase(_storeId, _productId, _receiptId, msg.sender);
    }
}