var StoreOwners = artifacts.require("./StoreOwners.sol");

contract('StoreOwners', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1];
  const bob = accounts[2];
  const jack = accounts[3];
  const will = accounts[4];
  
  const deposit = web3.toBigNumber(2);
  
  //Wrote this test to ensure the owner property is being added to the storeOwners mapping properly.
  it("Check that the owner is a storeowner by default", async () => {
    const contract = await StoreOwners.deployed();

    const ownerEnrolled = await contract.storeOwners.call(owner);
    assert.equal(ownerEnrolled, true, 'Owner should be a store owner');
  });

  //Wrote this test to ensure that addresses can be added to storeOwners mapping.
  it("Check that an address can be added.", async () => {
    const contract = await StoreOwners.deployed();

    const aliceEnrolled = await contract.storeOwners.call(alice);
    assert.equal(aliceEnrolled, false, 'Alice should not be a store owner');

    await contract.addStoreOwner(alice, {from: owner});

    const aliceNowEnrolled = await contract.storeOwners.call(alice);
    assert.equal(aliceNowEnrolled, true, 'Alice should now be enrolled');
  });

  //Wrote this test to ensure that addresses can be removed to storeOwners mapping.

  it("Check that an address can be removed.", async () => {
    const contract = await StoreOwners.deployed();
    await contract.addStoreOwner(bob, {from: owner});

    const bobOwner = await contract.storeOwners.call(bob);
    assert.equal(bobOwner, true, 'Bob should be a store owner');

    await contract.removeStoreOwner(bob, {from: owner});

    const bobNotOwner = await contract.storeOwners.call(bob);
    assert.equal(bobNotOwner, false, 'Bob should be now not be a store owner');
  });

  //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that the LogNewStoreOwner is fired", async () => {
    const contract = await StoreOwners.deployed();

    await contract.addStoreOwner(will, {from: owner});
    const expectedEventResult = {address: will};

    const LogAddition = await contract.LogNewStoreOwner();
    const log = await new Promise(function(resolve, reject) {
      LogAddition.watch(function(error, log){ resolve(log);});
    });

    const loggedAddress = log.args._address;

    assert.equal(expectedEventResult.address, loggedAddress, "LogNewStoreOwner event _address property not emmitted");
  });

    //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that the LogRemovedStoreOwner is fired", async () => {
    const contract = await StoreOwners.deployed();

    await contract.addStoreOwner(jack, {from: owner});
    await contract.removeStoreOwner(jack, {from: owner});
    const expectedEventResult = {address: jack};

    const LogRemoval = await contract.LogRemovedStoreOwner();
    const log = await new Promise(function(resolve, reject) {
        LogRemoval.watch(function(error, log){ resolve(log);});
    });

    const loggedAddress = log.args._address;

    assert.equal(expectedEventResult.address, loggedAddress, "LogNewStoreOwner event _address property not emmitted");
  });
});
