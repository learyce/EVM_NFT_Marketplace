App = {
  web3Provider: null,
  StoreFront: null,
  userAccount: null, 
  

  init: function() {
    // Load pets.
  
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    } 
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Storefront.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        StoreFront = TruffleContract(data);
      
        // Set the provider for our contract
        StoreFront.setProvider(App.web3Provider);
        App.bindContractEvents();
      
        var accountInterval = setInterval(function() {
          // Check if account has changed
          if (web3.eth.accounts[0] !== App.userAccount) {
            App.userAccount = web3.eth.accounts[0];
            $("#nav-owner").addClass('hidden');
            $("#nav-admin").addClass('hidden');
            $("#nav-storeManager").addClass('hidden');

            $("#owner-tab").addClass('hidden');
            $("#administration-tab").addClass('hidden');
            $("#storeManager-tab").addClass('hidden');

            App.LoadStores();
            App.LoadReceipts();


            // Call a function to update the UI with the new account
            App.intitalizeOwnerHeader(null, App.userAccount);
            App.intitalizeAdminHeader(null, App.userAccount);
            App.intitalizeStoreOwnerHeader(null, App.userAccount);
          }
        }, 100);
        
      });
    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '.btn-add-admin', App.AddNewContractAdmin);
    $(document).on('click', '.btn-remove-admin', App.RemoveContractAdmin);
    $(document).on('click', '.btn-remove-storeOwner', App.RemoveStoreOwnerAddress);
    $(document).on('click', '.btn-add-storeOwner', App.AddNewStoreOwnerAddress);
    $(document).on('click', '.btn-createStore', App.AddStore);
    $(document).on('click', '.btn-updateProduct', App.UpdateProduct);
    $(document).on('click', '.btn-createProduct', App.CreateProduct);
    $(document).on('click', '.btn-buyProduct', App.BuyProduct);
    $(document).on('click', '.btn-withdraw', App.Withdraw);
  },
  bindContractEvents: async function() {
    App.bindNewAdminEvent();
    App.bindRemoveAdminEvent();
    App.bindNewStoreOwnerEvent();
    App.bindRemoveStoreOwnerEvent();
    App.bindNewStoreEvent();
    App.bindNewProductEvent();
    App.bindProductUpdateEvent();
    App.bindProductPurchaseEvent();
    App.bindWithdrawEvent();
  },
  bindNewAdminEvent: async function() {
    var contract = await StoreFront.deployed();

    var newAdminEvent = await contract.LogNewAdmin();
    newAdminEvent.watch(function(error, result){
      $("#alertAdminSucces").removeClass('hidden');
      $("#alertAdminSuccessMessage").html("Successfully added " + result._address);
    });
  },
  bindRemoveAdminEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogRemovedAdmin();
    event.watch(function(error, result){
      $("#alertAdminSucces").removeClass('hidden');
      $("#alertAdminSuccessMessage").html("Successfully removed " + result._address);
    });
  },
  bindNewStoreOwnerEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogNewStoreOwner();
    event.watch(function(error, result){
      $("#alertStoreOwnerSucces").removeClass('hidden');
      $("#alertStoreOwnerSuccessMessage").html("Successfully added " + result._address);
    });
  },
  bindRemoveStoreOwnerEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogRemovedStoreOwner();
    event.watch(function(error, result){
      $("#alertStoreOwnerSucces").removeClass('hidden');
      $("#alertStoreOwnerSuccessMessage").html("Successfully removed " + result._address);
    });
  },
  bindNewProductEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogNewProduct();
    //event LogNewProduct(uint _storeId, uint _productId);
    event.watch(function(error, result){
      console.log("newProduct");
      App.LoadStores();
    });
  },
  bindProductUpdateEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogProductUpdate();
    //event LogProductUpdate(uint _storeId, uint _productId);

    event.watch(function(error, result){
      console.log("newProductUpdate");
      App.LoadStores();
    });
  },
  bindProductPurchaseEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogProductPurchase();
        //event LogProductPurchase(uint _storeId, uint _productId, uint _receiptId, address _address);

    event.watch(function(error, result){
      console.log("newProductUpdate");
      App.LoadReceipts();
      App.LoadStores();
    });
  },
  bindWithdrawEvent: async function() {
    var contract = await StoreFront.deployed();

    var event = await contract.LogWithdrawl();
    //event LogWithdrawl(uint _storeId);
    event.watch(function(error, result){
      App.LoadStores();
    });
  },
  bindNewStoreEvent: async function() {
    var contract = await StoreFront.deployed();

    var newStoreEvent = await contract.LogNewStore();
    newStoreEvent.watch(function(error, result){
      $("#alertCreateStoreSucces").show();
      $("#alertCreateStoreSuccesMessage").html("Successfully added new store");
      App.LoadStores();
    });
  },

  intitalizeOwnerHeader: async function(data, account) {
    try {
      var contract = await StoreFront.deployed();

      var owner = await contract.getOwner();

      if(owner == App.userAccount){
        $("#nav-owner").removeClass('hidden');
        $("#owner-tab").removeClass('hidden');
        $("#nav-owner").addClass('active');
        $("#owner-tab").addClass('active');
      }

    } catch(e) {
      console.log(e);
    }
  },
  intitalizeAdminHeader: async function(data, account) {
    try {

      var contract = await StoreFront.deployed();
      var isAdmin = await contract.administrators.call(App.userAccount);

      if(isAdmin){
        $("#nav-admin").removeClass('hidden');
        $("#administration-tab").removeClass('hidden');
      }
    } catch(e) {
      console.log(e);
    }
  },
  intitalizeStoreOwnerHeader: async function(data, account) {
    try {
      var contract = await StoreFront.deployed();
      var isStoreOwner = await contract.storeOwners.call(App.userAccount);

      if(isStoreOwner)
      {
        $("#nav-storeManager").removeClass('hidden');
        $("#storeManager-tab").removeClass('hidden');
      }
        
    } catch(e) {
      console.log(e);
    }
  },
  AddNewStoreOwnerAddress: async function() {
    try {
      $("#alertStoreOwnerFailure").addClass('hidden');
      $("#alertStoreOwnerSuccess").addClass('hidden');

      var contract = await StoreFront.deployed();
      var accountToAdd = document.getElementById("storeOwnerUpdate").value;
      await contract.addStoreOwner(accountToAdd, {from: App.userAccount});

    } catch(e) {
      $("#alertStoreOwnerFailure").removeClass('hidden');
      $("#alertStoreOwnerFailureMessage").html("Failed to add new contract");
      console.log(e);
    }
  },
  RemoveStoreOwnerAddress: async function() {
    try {
      $("#alertStoreOwnerFailure").addClass('hidden');
      $("#alertStoreOwnerSuccess").addClass('hidden');

      var contract = await StoreFront.deployed();
      var accountToAdd = document.getElementById("storeOwnerUpdate").value;
      await contract.removeStoreOwner(accountToAdd, {from: App.userAccount, gas: 60000});

    } catch(e) {
      $("#alertStoreOwnerFailure").removeClass('hidden');
      $("#alertStoreOwnerFailureMessage").html("Failed to remove contract");
      console.log(e);
    }
  },
  AddNewContractAdmin: async function() {
    try {
      $("#alertAdminFailure").addClass('hidden');
      $("#alertAdminSuccess").addClass('hidden');

      var contract = await StoreFront.deployed();
      var accountToAdd = document.getElementById("adminUpdate").value;
      await contract.addAdmin(accountToAdd, {from: App.userAccount});
    } catch(e) {
      $("#alertAdminFailure").removeClass('hidden');
      $("#alertAdminFailureMessage").html("Failed to add new contract");
      console.log(e);
    }
  },
  RemoveContractAdmin: async function() {
    try {
      $("#alertAdminFailure").addClass('hidden');
      $("#alertAdminSuccess").addClass('hidden');

      var contract = await StoreFront.deployed();
      var accountToAdd = document.getElementById("adminUpdate").value;
      await contract.removeAdmin(accountToAdd, {from: App.userAccount, gas: 60000});
    } catch(e) {
      $("#alertAdminFailure").removeClass('hidden');
      $("#alertAdminFailureMessage").html("Failed to remove contract");
      console.log(e);
    }
  },
  AddStore: async function() {
    try {
      $("#alertCreateStoreSucces").addClass('hidden');
      $("#alertCreateStoreFailure").addClass('hidden');

      var contract = await StoreFront.deployed();

      await contract.createStore({from: App.userAccount});
    } catch(e) {
      $("#alertCreateStoreFailure").removeClass('hidden');
      $("#alertCreateStoreFailureMessage").html("Failed to add store");
      console.log(e);
    }
  },
  LoadStores: async function() {
    try{
      var contract = await StoreFront.deployed();
      var allStores = await contract.getAllStores({from: App.userAccount});

      var ownersStoresTemp = '';
      var allStoresTemp = '';
      var storeTemplate = $('#storeTemplate');
      var productTemplate = $('#productTemplate');

      for (var i = 0; i < allStores.length; i ++) {
        
        var storeOwner = await contract.storeToOwner.call(allStores[i].toNumber());

        var storeInfo = await contract.getStore(allStores[i].toNumber());
        var allProducts = await contract.getAllProductsByStore(allStores[i].toNumber());

        
        storeTemplate.find('.store-open').text(storeInfo[0]);
        storeTemplate.find('.store-id').text(allStores[i].toNumber());
        storeTemplate.find('.store-balance').text(storeInfo[1].toNumber());
        storeTemplate.find('.store-productCount').text(allProducts.length);
        var productRowTemp = '';
        //Load the individual product options
        for(var j = 0; j < allProducts.length; j++) {
          var productInfo = await contract.getProduct(i, j);

          productTemplate.find('.product-id').text(j);
          productTemplate.find('.product-price').text(productInfo[0].toNumber());
          productTemplate.find('.product-quantity').text(productInfo[1].toNumber());
          productRowTemp = productRowTemp.concat(productTemplate.html());
        }
        var storeOwnerRow = storeTemplate.find('#storeOwnerOptions');

        storeOwnerRow.html('');
        storeOwnerRow.append(productRowTemp);
        
        if(storeOwner == App.userAccount){
          //Display in the store owner section.
          ownersStoresTemp = ownersStoresTemp.concat(storeTemplate.html());
        }    
        allStoresTemp = allStoresTemp.concat(storeTemplate.html());
        
      }

      var storesByOwner = $('#storesByOwnerTemplate');
      var allStoresRow = $('#allStores');

      storesByOwner.html('');
      allStoresRow.html('');

      storesByOwner.append(ownersStoresTemp);
      allStoresRow.append(allStoresTemp);


      
    } catch(e) {
      console.log(e);
    }
  },
  LoadReceipts: async function() {
    try{
      var contract = await StoreFront.deployed();

      var userReceipts = await contract.getAllReceiptsByCustomer(App.userAccount, {from: App.userAccount});

      var receiptRow = $('#customersReceipts');
      var receiptTemplate = $('#receiptTemplate');
      receiptRow.html('');

      for (var i = 0; i < userReceipts.length; i ++) {
        var receipt = await contract.getReceipt.call(App.userAccount, userReceipts[0].toNumber());

        receiptTemplate.find('.receipt-store').text(receipt[0].toNumber());
        receiptTemplate.find('.receipt-product').text(receipt[1].toNumber());
        receiptTemplate.find('.receipt-price').text(receipt[2].toNumber());
        receiptTemplate.find('.receipt-blockNumber').text(receipt[3].toNumber());        

        receiptRow.append(receiptTemplate.html());
      }
    } catch(e) {
      console.log(e);
    }
  },

  CreateProduct: async function() {
    try {
      event.preventDefault();

      var storeId = document.getElementById("updateStoreId").value;
      var price = document.getElementById("updateProductPrice").value;
      var quantity = document.getElementById("updateProductQuantity").value;
      
      var contract = await StoreFront.deployed();
      await contract.addProduct(storeId, price, quantity, {from: App.userAccount});
    } catch(e) {
      console.log(e);
    }
  },

  UpdateProduct: async function() {
    try {
      event.preventDefault();

      var storeId = document.getElementById("updateStoreId").value;
      var productId = document.getElementById("updateProductId").value;
      var price = document.getElementById("updateProductPrice").value;
      var quantity = document.getElementById("updateProductQuantity").value;
      
      var contract = await StoreFront.deployed();
      await contract.editProduct(storeId, productId, price, quantity, {from: App.userAccount});
    } catch(e) {
      console.log(e);
    }
  },
  BuyProduct: async function() {
    try {
      event.preventDefault();

      var storeId = document.getElementById("buyStoreId").value;
      var productId = document.getElementById("buyProductId").value;
      
      var contract = await StoreFront.deployed();

     var productInfo = await contract.getProduct(storeId, productId);



      await contract.buyProduct(storeId, productId, {from: App.userAccount, value: productInfo[0].toNumber()});
    } catch(e) {
      console.log(e);
    }
  },

  Withdraw: async function() {
    try {
      event.preventDefault();

      var storeId = document.getElementById("withdrawStoreId").value;     
      
      var contract = await StoreFront.deployed();

     await contract.withdraw(storeId, {from:App.userAccount, gas: 60000 });

    } catch(e) {
      console.log(e);
    }
  },

  /* $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });
    */

  /* markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  }
  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
  */  
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});
