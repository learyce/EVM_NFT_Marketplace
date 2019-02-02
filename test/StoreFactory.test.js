var StoreFactory = artifacts.require("./StoreFactory.sol");

contract('StoreFactory', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1];
  const bob = accounts[2];
  const jack = accounts[3];
  const will = accounts[4];
  
  const deposit = web3.toBigNumber(2);

  //Create new test to make sure owner is set properly
  it("No issues creating a new store", async () => {
    const contract = await StoreFactory.deployed();
    await contract.createStore({from: owner});
  });

  //Written to make sure that newly added storeOwners are able to create stores.
  it("Check that a storeOwner can be added and they can add a store", async () => {
    const contract = await StoreFactory.deployed();

    await contract.addStoreOwner(alice, {from: owner});
    await contract.createStore({from: alice});
  });
  //Written to make sure that newly added stores have a balance of zero
  it("Check that the new store create has a balance of zero", async () => {
    const contract = await StoreFactory.deployed();

    await contract.createStore({from: owner});
    //It's okay if another test creates a store.  Since we won't be updating the balance in any tests, it doesn't matter.
    var storeInfo = await contract.getStore.call(0);

    assert.equal(storeInfo[1].toNumber(), 0, "New Store Balance is 0 ");
    assert.equal(storeInfo[0], true, "New Store Exists");    
  });

    //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that LogNewStore works", async () => {
    const contract = await StoreFactory.deployed();

    await contract.createStore({from: owner});

    const LogStoreCreation = await contract.LogNewStore();
    const log = await new Promise(function(resolve, reject) {
        LogStoreCreation.watch(function(error, log){ resolve(log);});
    });
    const newStoreId = log.args._storeId;
    const newStoreOwner = await contract.storeToOwner.call(newStoreId);

    assert.equal(newStoreOwner, owner, "Store added and storeToOwner set correctly"); 
  });

  //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that storeToOwner is being set properly", async () => {
    const contract = await StoreFactory.deployed();

    await contract.addStoreOwner(jack, {from: owner});
    await contract.createStore({from: jack});

    const LogStoreCreation = await contract.LogNewStore();
    const log = await new Promise(function(resolve, reject) {
        LogStoreCreation.watch(function(error, log){ resolve(log);});
    });
    const newStoreId = log.args._storeId;
    const newStoreOwner = await contract.storeToOwner.call(newStoreId);

    assert.equal(newStoreOwner, jack, "Store added and storeToOwner set correctly"); 
  });


});
