var ProductFactory = artifacts.require("./ProductFactory.sol");

contract('ProductFactory', function(accounts) {

  const owner = accounts[0];
  
  const deposit = web3.toBigNumber(2);

  //Making sure adding a new product to an existing store works without errors
  it("No issues adding a new product", async () => {
    const contract = await ProductFactory.deployed();
    await contract.createStore({from: owner});

    var result = await contract.addProduct(0, 100, 100, {from: owner});
    assert.isTrue(!!result.receipt.transactionHash, "Add product should succeed");
  });
  
  //Making sure that paramaters of a product added to a store are set correctly
  it("Products are properly added. ", async () => {
    const contract = await ProductFactory.deployed();
    const price = 101;
    const quality = 15;

    await contract.createStore({from: owner});

    const LogStoreCreation = await contract.LogNewStore();
    const log = await new Promise(function(resolve, reject) {
        LogStoreCreation.watch(function(error, log){ resolve(log);});
    });

    const newStoreId = log.args._storeId;
    await contract.addProduct(newStoreId, price, quality, {from: owner});

    const LogProductCreation = await contract.LogNewProduct();
    const logProduct = await new Promise(function(resolve, reject) {
        LogProductCreation.watch(function(error, logProduct){ resolve(logProduct);});
    });
    
    const results = await contract.getProduct(logProduct.args._storeId, logProduct.args._productId);

    assert.equal(logProduct.args._storeId.toNumber(), newStoreId.toNumber(), "Product has been added to the correct store");
    assert.equal(results[0].toNumber(), price, "The price of the product matches the our original price ");
    assert.equal(results[1].toNumber(), quality, "The price of the quality matches the our original quality");
  });

  //Making sure that the editProduct function works correctly.
  it("Products are properly editted properly. ", async () => {
    const contract = await ProductFactory.deployed();
    const price = 150;
    const quality = 15;

    const newPrice = 160;
    const newQuality = 9;

    await contract.createStore({from: owner});
    await contract.addProduct(0, price, quality, {from: owner});

    await contract.editProduct(0, 0, newPrice, newQuality, {from: owner});

    const LogProductEdit = await contract.LogProductUpdate();
    const logEdit = await new Promise(function(resolve, reject) {
        LogProductEdit.watch(function(error, logEdit){ resolve(logEdit);});
    });

    const results = await contract.getProduct(logEdit.args._storeId, logEdit.args._productId);

    assert.equal(results[0].toNumber(), newPrice, "The price of the product matches the our original price ");
    assert.equal(results[1].toNumber(), newQuality, "The price of the quality matches the our original quality");
  });

  //Ensure that prducts can be purchased and the quantity of that product decreases.
  it("Products can be purchased. ", async () => {
    const contract = await ProductFactory.deployed();

    await contract.createStore({from: owner});
    await contract.createStore({from: owner});
    await contract.addProduct(1, 100, 10, {from: owner});

    const results = await contract.getProduct(1, 0);

    const price = results[0].toNumber();
    const quality = results[1].toNumber();

    await contract.buyProduct(1, 0, {from: owner, value: price});

    const LogPurchase = await contract.LogProductPurchase();
    const log = await new Promise(function(resolve, reject) {
        LogPurchase.watch(function(error, log){ resolve(log);});
    });

    const updatedProduct = await contract.getProduct(1, 0);
    assert.equal(updatedProduct[1].toNumber(), quality - 1, "The difference in quality should be 1");

    //Verify that a receipt has been created.

    const receipt = await contract.getReceipt(owner, 0, {from: owner});
    assert.equal(receipt[0].toNumber(), 1);
    assert.equal(receipt[1].toNumber(), 0);
    assert.equal(receipt[2].toNumber(), price);
  });

  //Make sure that after a product has been purchased, the corresponding's stores balance has increased.
  it("Store balance updated. ", async () => {
    const contract = await ProductFactory.deployed();

    await contract.createStore({from: owner});
    await contract.createStore({from: owner});
    await contract.addProduct(1, 100, 10, {from: owner});
    await contract.addProduct(1, 100, 10, {from: owner});

    var storeInfo = await contract.getStore.call(1);
    const results = await contract.getProduct(1, 1);
    const price = results[0].toNumber();
    
    await contract.buyProduct(1, 1, {from: owner, value: price});

    var updatedStoreInfo = await contract.getStore.call(1);

    assert.equal(storeInfo[1].toNumber() + price, updatedStoreInfo[1].toNumber(), "The store's balance should change by the price of the good");
  });
});
