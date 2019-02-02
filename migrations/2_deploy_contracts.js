var Storefront = artifacts.require("./Storefront.sol");
var StoreOwners = artifacts.require("./StoreOwners.sol");
var Administrators = artifacts.require("./Administrators.sol");
var StoreFactory = artifacts.require("./StoreFactory.sol");
var ProductFactory = artifacts.require("./ProductFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(Storefront);
  deployer.deploy(StoreOwners);
  deployer.deploy(Administrators);
  deployer.deploy(StoreFactory);
  deployer.deploy(ProductFactory);
};
