// const mysql = require("mysql2");

// //createpool it manages multiple connection in mysql

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "Node-learning",
//   password: "Vijay@4944",
// });

// module.exports = pool.promise();

//using sequelize here

const Sequelize = require("sequelize");
const sequelize = new Sequelize("Node-learning", "root", "Vijay@4944", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
