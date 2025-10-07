const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {
  console.log("in the another middleware");
  res.send("<h1>Hello from express </h1>");
});
module.exports = route;
