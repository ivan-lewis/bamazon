// Initializes the npm packages used
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Connection to SQL database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    // test to ensure my connection is made
    // console.log("connected as id " + connection.threadId);
    showProducts();
  });


function showProducts() {
    // Show the products for sale using console.table(res)
    connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    // Display products table and start sale
    console.table(res);
    startSale(res);  
    })
  };

  function startSale(inventory){
    // Ask customer what they would like to buy
    inquirer
      .prompt([
        {
          type: "input",
          name: "buy",
          message: "Pleast type the item_id of the product you would like to buy",
        }
      ])
      
    .then(function(val){
      var buyId = parseInt(val.buy);
      var product = inventoryCheck(buyId, inventory);

      // Ask customer how many they would like to buy
      if (product){
        // Send product to getQuantity function
        getQuantity(product);
      }
      else{
        console.log("\nSorry many outta this product.");
        showProducts();
      }

    })      
};

// Ask customer for quantity
function getQuantity(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many can we get for you?",
      }
    ])
    .then(function(val) {   
      var quantity = parseInt(val.quantity);

      // Check if there is a sufficient amount in stock
      if (quantity > product.stock_quantity) {
        console.log("\nNot enough in stock my friend");
        showProducts();
      }
      else {
      // If there is, purchase it/them
        purchase(product, quantity);
      }
    });
}

// Perform the transaction
function purchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
      // let the customer know that the transaction was made
      console.log("\nSale complete");
      showProducts();
    }
  );
}

// Check if the product is in stock
function inventoryCheck(buyId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === buyId) {
      // If a matching product is found, return the product
      return inventory[i];
    }
  }
  // Otherwise return null
  return null;
}
