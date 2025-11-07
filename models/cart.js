const fs = require("fs");
const path = require("path");
// Removed controller/route requires to avoid circular dependency with Product

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);
module.exports = class Cart {
  static addProduct(id, productPrice) {
    //fetching the previous cart
    fs.readFile(p, (err, filecontent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(filecontent);
      }
      //analysing the cart and finding the existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      //product is adding and keeping track of the price
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, filecontent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(filecontent) };
      const product = updatedCart.products.find((prod) => prod.id === id);
      if (!product) {
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice;

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log("erron in the cart.js", err);
      });
    });
  }
  static getCart(cb) {
    fs.readFile(p, (err, filecontent) => {
      if (err) {
        cb(null);
      } else {
        const cart = JSON.parse(filecontent);
        cb(cart);
      }
    });
  }
};
