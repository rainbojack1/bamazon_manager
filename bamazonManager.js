var inquirer = require('inquirer');
var mysql = require('mysql');
var connection = mysql.createConnection({
host: 'localhost',
port: 3306,
user: 'root',
password: 'Atlanta83',
database: 'bamazonDB'
});

start();

function start(){
connection.connect(function (err) {
    if(err) throw err;
    
    inquirer
    .prompt([
    {
        name: "startMenu",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add  a New Product", "Display Sales Figures"]
    }
    ])
    .then((response) => {
    switch (response.startMenu) {
        case "View Products for Sale":
            viewAll();
            break;
        case "View Low Inventory":
            viewLow();
            break;
        case "Add to Inventory":
            incInventory();
            break;
        case "Add  a New Product":
            addNewProduct();
            break; 
        case "Display Sales Figures":
                displaySalesFigures();
            break;  
        default:            
            break;
    }
    })
    .catch((err) => {
        console.error(err.message);
    });
});
}

function nextOption(){
    inquirer
    .prompt([
      {
          name: "next",
          type: "list",
          message: "Would you like to return to the main menu?",
          choices: ["yes", "no"]
      }
    ])
    .then((response) => {
      if(response.next === "yes"){
          start();
      }else{
        connection.end();
      }
    })
    .catch((err) => {
        console.error(err.message);
    });
}

function viewAll(){
    connection.query('SELECT * FROM products', function(err, res) {
        if(err) throw err;
        
        for (let i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: " + res[i].price + "\nQuantity: " + res[i].stock_quantity + "\n");
        }

        nextOption();
    });
}

function viewLow(){
    connection.query('SELECT * FROM products WHERE stock_quantity < 5', function(err, res) {
        if(err) throw err;

        for (let i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: " + res[i].price + "\nQuantity: " + res[i].stock_quantity + "\n");
        }

        nextOption();
    });
}

function incInventory(){
    inquirer
        .prompt([
            {
                name: "whatToChange",
                type: "number",
                message: "Please enter the ID of the product you would like to modify."  
            },
            {
                name: "howManyToAdd",
                type: "number",
                message: "How many would you like to add?",
                validate: function(value) {
                  if ((isNaN(value) === false) && (value > 0)) {
                      return true;
                  }else{
                      return "Please enter a valid number for the amount you would like to add.";
                  }
                }
              }
        ])
        .then((response) => {
            let itemId = response.whatToChange;
            let amount = response.howManyToAdd;
      
            connection.query("UPDATE products SET stock_quantity = (stock_quantity + ?) WHERE item_id=?", [amount, itemId], function(err, res){
                if(err) throw err;
                console.log("\nYou are adding " + amount + " of " + res.product_name + ".\n");
                updatedProduct(itemId);

            });
        })
        .catch((err) => {
            console.error(err.message);
        });
}

function updatedProduct(itemId){
    connection.query("SELECT * FROM products WHERE item_id=?", [itemId], function(err, res){
         if(err) throw err;
         console.log("Product updated:\nID: " + res[0].item_id + "\nProduct: " + res[0].product_name + "\nDepartment: " + res[0].department_name + "\nPrice: " + res[0].price + "\nQuantity: " + res[0].stock_quantity + "\n");
 
         nextOption();
     });
 }

function addNewProduct(){
    inquirer
    .prompt([
      {
          name: "name",
          type: "input",
          message: "What is the name of the product?"
      },
      {
        name: "dept",
        type: "input",
        message: "What is the name of the department?"
    },
    {
        name: "price",
        type: "number",
        message: "How much does it cost?",
        validate: function(value) {
            if ((isNaN(value) === false) && (value > 0)) {
                return true;
            }else{
                return "Please enter a valid price for the product you would like to add.";
            }
          }
    },
    {
        name: "quantity",
        type: "number",
        message: "How many do you have to sell?",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }else{
                return "Please enter a valid number for the quantity you would like to add.";
            }
          }
    }
    ])
    .then((response) => {
      connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?, ?, ?, ?)", [response.name, response.dept, response.price, response.quantity], function(err, res){
        if(err) throw err;

        console.log("Product Added.");
        
        nextOption();
      });
    })
    .catch((err) => {
        console.error(err.message);
    });
}

function displaySalesFigures(){
    connection.query("SELECT * FROM sales", function(err, res){
        if(err) throw err;

        let revArr = [];
        let deptArr = [];
        console.log("\n");
        for (let i = 0; i < res.length; i++) {
            console.log("Department: " + res[i].department_name + ";  Revenue: $" + res[i].revenue);
            revArr.push(res[i].revenue);
            deptArr.push(res[i].department_name);
        }
       
        let temp =  Math.max(...revArr);
        let position = revArr.indexOf(temp);
        
        console.log("\n***Highest Grossing Department: " + deptArr[position] + "***");
        
        nextOption();
    });    
}