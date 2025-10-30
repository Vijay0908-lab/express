const path = require("path");

const express = require("express");

const productController = require("../controllers/products");

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/products");
router.get("/cart");

module.exports = router;
