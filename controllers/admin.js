const { validationResult } = require("express-validator");
const Product = require("../models/product");
const mongoose = require("mongoose");
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  const error = validationResult(req);

  if (!image) {
    console.log(image);
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      hasError: true,
      editing: false,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
    });
  }

  if (!error.isEmpty()) {
    console.log(err.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      hasError: true,
      editing: false,
      product: {
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
      },
      errorMessage: error.array()[0].msg,
      validationErrors: error.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("in the post add product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("error in postADD");
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      hasError: true,
      editing: true,
      product: {
        title: updatedTitle,
        //imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: error.array()[0].msg,
      validationErrors: error.array(),
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (image) {
        product.imageUrl = image.path;
      }
      //product.imageUrl = updatedImageUrl;
      return product.save().then((result) => {
        //console.log("result in postEdit product in admin.js", result);
        res.redirect("/admin/products");
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    //.populate("userId")
    .then((products) => {
      //console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then((result) => {
      console.log("result in postDelete  product in admin.js", result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
  // res.redirect("/admin/products");
};
