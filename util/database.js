const mysql = require("mysql2");

//createpool it manages multiple connection in mysql

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "Node-learning",
  password: "Vijay@4944",
});

module.exports = pool.promise();
