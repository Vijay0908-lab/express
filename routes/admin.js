const express = require("express");
const path = require("path");
const router = express.Router();
const rootDir = require("../util/path");

const product = [];
router.get("/add-product", (req, res, next) => {
  console.log("in the first middleware");
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

router.post("/add-product", (req, res, next) => {
  product.push({ title: req.body.title });
  res.redirect("/");
});

exports.routes = router;
exports.product = product;
