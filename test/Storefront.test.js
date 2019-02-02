var Storefront = artifacts.require("./Storefront.sol");

contract('Storefront', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1];
  const bob = accounts[5];

  const price = web3.toWei(2, "ether");

  //Check that the GetAllStores function works correctly
  it("Check that return all stores returns correctly", async () => {
    const contract = await Storefront.deployed();
    await contract.addStoreOwner(bob, {from: owner});
    
    await contract.createStore({from: bob});
    await contract.createStore({from: bob});
    await contract.createStore({from: bob});

    var response = await contract.getAllStores({from: bob});

    assert.equal(response.length, 3);

    assert.equal(response[0].toNumber(), 0);
    assert.equal(response[1].toNumber(), 1);
    assert.equal(response[2].toNumber(), 2);
  });
  //Check that the GetAllProducts function works correctly
  it("Check that return all products returns correctly", async () => {
    const contract = await Storefront.deployed();
    await contract.addProduct(0, price, 15, {from: bob});
    await contract.addProduct(0, 150, 20, {from: bob});
    await contract.addProduct(0, 200, 25, {from: bob});

    var response = await contract.getAllProductsByStore(0, {from: alice});

    assert.equal(response.length, 3);

    assert.equal(response[0].toNumber(), 0);
    assert.equal(response[1].toNumber(), 1);
    assert.equal(response[2].toNumber(), 2);
  });

  //Check that the GetAllRecieptsByCustomer function works correctly
  it("Check that return get all receipts by customer return correctly", async () => {
    const contract = await Storefront.deployed();
    await contract.buyProduct(0, 0, {from: alice, value: price});
    await contract.buyProduct(0, 0, {from: alice, value: price});
    await contract.buyProduct(0, 0, {from: alice, value: price});

    var response = await contract.getAllReceiptsByCustomer(alice, {from: alice});

    assert.equal(response.length, 3);

    assert.equal(response[0].toNumber(), 0);
    assert.equal(response[1].toNumber(), 1);
    assert.equal(response[2].toNumber(), 2);
  });
  //Check that purchasing an item, decreases a persons eth.
  it("Check that the store balances decreases the eth in wallet", async () => {
    const contract = await Storefront.deployed();
    
    var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();

    await contract.buyProduct(0, 0, {from: alice, value: price});

    var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();

    assert.isBelow(aliceBalanceAfter, aliceBalanceBefore - price, "alice's balance should be decreased by at least the price of the item");
  });

  //Make sure that a user who calls the withdraw function, receives their eth from the store.
  it("Check that the withdraw works", async () => {
    const contract = await Storefront.deployed();
    
    var bobsBalanceBefore = await web3.eth.getBalance(bob).toNumber();

    await contract.withdraw(0, {from: bob});

    var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber();

    assert.isBelow(bobsBalanceBefore, bobBalanceAfter, "Bob's Balance should be higher than it was before");
  });
});
