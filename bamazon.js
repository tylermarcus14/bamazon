const mysql = require("mysql");
const inquirer = require ("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  productList();  
});

//dispalys products from database
function productList(){
  var query="SELECT * FROM products"
  connection.query(query,
  function(err, res) {
  if (err) throw err;
  console.table(res);
  purchaseItems();
  })};

//inquirer prompt, to ask user what to purchase + amount
var productQuantity = 0;
var productChoice = "";
function purchaseItems(){
  inquirer.prompt([
    {
      type: "input",
      name: "item",
      message:"What would you like to purchase?"
    },
    {
      type:"input",
      name:"quantity",
      message: "How many would you like to purchase?"
    }
  ]).then(function(answer){
    productQuantity = answer.quantity;
    productChoice = answer.item;
      updateTable(productQuantity,productChoice);    
  })
}

function updateTable(purchaseQty, productChoice){
  var query= "SELECT * FROM products WHERE ?";
  connection.query(query,[{product_name:productChoice}],
     function(err,res){
      if (err) throw err;
      //inventory check
      if (productQuantity <= res[0].stock_quantity){
        var totalAmount = res[0].price * purchaseQty;
        var totalNice = totalAmount.toFixed(2);
        console.log("Your total is $" + totalNice + " for a quantity of " + productQuantity + " " + productChoice + "'s.");
        // update table 
        connection.query("UPDATE products SET ? WHERE ?",[{stock_quantity: res[0].stock_quantity-productQuantity},{product_name: productChoice}])
      }
      else{
        console.log("Sorry, we do not have enough "+productChoice+" availbe to purchase.");
      }
      // show the updated table
      purchaseAgain();
      
    }); 
}

// checks if customer wants to buy another product
function purchaseAgain(){
inquirer.prompt([
    {
      type: "confirm",
      name: "run_again",
      message:"Would you like to purchase another item?",
      default: true
    }
  ]).then(function(answer){
    if (answer.run_again){
    productList()
    }
    else{
    connection.end()
    }
  })
}