var Administrators = artifacts.require("./Administrators.sol");

contract('Administrators', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1];
  const bob = accounts[2];
  const jack = accounts[3];
  const will = accounts[4];
  
  const deposit = web3.toBigNumber(2);
  //Wrote this test to ensure the owner property is being added to the administrators mapping properly.
  it("Check that the owner is an admin by default", async () => {
    const contract = await Administrators.deployed();

    const ownerEnrolled = await contract.administrators.call(owner);
    assert.equal(ownerEnrolled, true, 'Owner should be a store owner');
  });
  //Wrote this test to ensure that addresses can be added to administrators mapping.
  it("Check that an address can be added.", async () => {
    const contract = await Administrators.deployed();

    const aliceEnrolled = await contract.administrators.call(alice);
    assert.equal(aliceEnrolled, false, 'Alice should not be a store owner');

    await contract.addAdmin(alice, {from: owner});

    const aliceNowEnrolled = await contract.administrators.call(alice);
    assert.equal(aliceNowEnrolled, true, 'Alice should now be enrolled');
  });
  //Wrote this test to ensure that addresses can be removed to administrators mapping.
  it("Check that an address can be removed.", async () => {
    const contract = await Administrators.deployed();
    await contract.addAdmin(bob, {from: owner});

    const bobOwner = await contract.administrators.call(bob);
    assert.equal(bobOwner, true, 'Bob should be a store owner');

    await contract.removeAdmin(bob, {from: owner});

    const bobNotOwner = await contract.administrators.call(bob);
    assert.equal(bobNotOwner, false, 'Bob should be now not be a store owner');
  });

    //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that the LogNewAdmin is fired", async () => {
    const contract = await Administrators.deployed();

    await contract.addAdmin(will, {from: owner});
    const expectedEventResult = {address: will};

    const LogAddition = await contract.LogNewAdmin();
    const log = await new Promise(function(resolve, reject) {
      LogAddition.watch(function(error, log){ resolve(log);});
    });

    const loggedAddress = log.args._address;

    assert.equal(expectedEventResult.address, loggedAddress, "LogNewAdmin event _address property not emmitted");
  });
  //Wrote this test to make sure the event was fire properly and returning the correct information
  it("Check that the LogRemovedAdmin is fired", async () => {
    const contract = await Administrators.deployed();

    await contract.addAdmin(jack, {from: owner});
    await contract.removeAdmin(jack, {from: owner});
    const expectedEventResult = {address: jack};

    const LogRemoval = await contract.LogRemovedAdmin();
    const log = await new Promise(function(resolve, reject) {
      LogRemoval.watch(function(error, log){ resolve(log);});
    });

    const loggedAddress = log.args._address;

    assert.equal(expectedEventResult.address, loggedAddress, "LogRemovedAdmin event _address property not emmitted");
  }); 
});
