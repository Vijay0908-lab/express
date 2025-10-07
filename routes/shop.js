const express = require("express");
const path = require("path");
const route = express.Router();
const rootDir = require("../util/path");

route.get("/", (req, res, next) => {
  console.log("in the another middleware");
  res.sendFile(path.join(rootDir, "views", "shop.html"));
  //the reason for using this is that __dirname, "../", "views", "shop.html" first it go up to the routes level then search for the vies and then point to the shop.html
});

module.exports = route;
