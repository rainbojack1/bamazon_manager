var inquirer = require('inquirer');
var mysql = require('mysql');
var connection = mysql.createConnection({
host: 'localhost',
port: 3306,
user: 'root',
password: 'Atlanta83',
database: 'bamazonDB'
});

connection.connect(function (err) {
    if(err) throw err;
    
    inquirer
    .prompt([
    {
        name: "startMenu",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add  a New Product"]
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
        default:
            addNewProduct();
            break;
    }
    })
    .catch((err) => {
        console.error(err.message);
    });
});

function viewAll(){
    connection.query('SELECT * FROM products', function(err, res) {
        if(err) throw err;
        
        for (let i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nDepartment: " + res[i].department_name + "\nPrice: " + res[i].price + "\nQuantity: " + res[i].stock_quantity + "\n");
        }

        
    });
}