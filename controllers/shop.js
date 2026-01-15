const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 2;
const Razorpay = require("razorpay");
const crypto = require("crypto");
//const require = require("require");
require("dotenv").config({ path: __dirname + "/.env" });

const rzp = new Razorpay({
  key_id: process.env.rzKey, // your `KEY_ID`
  key_secret: process.env.rzPass, // your `KEY_SECRET`
});

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      //console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getIndex = (req, res, next) => {
  //page beacuse the query parameter is the page
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")

    .then((user) => {
      const products = user.cart.items;
      //console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      //console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      console.log("about to create the option for payment");
      // Create Razorpay order
      const options = {
        amount: total * 100, // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      return rzp.orders.create(options);
    })
    .then((order) => {
      console.log("payment is done");
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        orderId: order.id, // Razorpay order ID
        keyId: process.env.rzKey,
        user: req.user, // Send key to frontend
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.verifyPayment = (req, res, next) => {
  console.log("in verify payment");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // Create signature to verify
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.rzPass)
    .update(body.toString())
    .digest("hex");
  console.log("in verify payment");
  // Verify signature
  if (expectedSignature === razorpay_signature) {
    // Payment is valid, create order
    req.user
      .populate("cart.items.productId")
      .then((user) => {
        const products = user.cart.items.map((i) => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });

        const order = new Order({
          user: {
            name: req.user.name,
            userId: req.user,
          },
          products: products,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        });
        return order.save();
      })
      .then((result) => {
        return req.user.clearCart();
      })
      .then(() => {
        res.json({ success: true, redirectUrl: "/orders" });
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ success: false, message: "Order creation failed" });
      });
  } else {
    // Invalid signature
    res
      .status(400)
      .json({ success: false, message: "Invalid payment signature" });
  }
};

exports.getCheckoutSuccess = (req, res, next) => {
  console.log("in checkout success");
  res.redirect("/orders");
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });

      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order is found"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Not authorised"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=" + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("--------------------------");
      let TotalPrice = 0;
      order.products.forEach((prod) => {
        TotalPrice = TotalPrice + prod.quantity * prod.product.price;

        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              "---" +
              " " +
              prod.quantity +
              " " +
              "x" +
              " " +
              "₹" +
              prod.product.price
          );
      });
      pdfDoc.fontSize(26).text("-----------------");
      pdfDoc.fontSize(20).text("Total Price : ₹" + TotalPrice);
      pdfDoc.end();
    })
    .catch((err) => {
      return next(err);
    });
};

// exports.getCheckoutSuccess = (req, res, next) => {
//   req.user
//     .populate("cart.items.productId")
//     .then((user) => {
//       //console.log(user.cart.items);
//       const products = user.cart.items.map((i) => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });

//       const order = new Order({
//         user: {
//           name: req.user.name,
//           userId: req.user,
//         },
//         products: products,
//       });
//       return order.save();
//     })
//     .then((result) => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect("/orders");
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       next(error);
//     });
// };

// exports.postOrder = (req, res, next) => {
//   req.user
//     .populate("cart.items.productId")
//     .then((user) => {
//       //console.log(user.cart.items);
//       const products = user.cart.items.map((i) => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });

//       const order = new Order({
//         user: {
//           name: req.user.name,
//           userId: req.user,
//         },
//         products: products,
//       });
//       return order.save();
//     })
//     .then((result) => {
//       return req.user.clearCart();
//     })
//     .then(() => {
//       res.redirect("/orders");
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       next(error);
//     });
// };

// exports.getOrders = (req, res, next) => {
//   //this ({include :['products ]}) is also a way to say that also include the products on which this relationship is build in the database
//   Order.find({ "user.userId": req.user._id })
//     .then((orders) => {
//       // console.log("printing the get order ", orders);
//       res.render("shop/orders", {
//         path: "/orders",
//         pageTitle: "Your Orders",
//         orders: orders,
//       });
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       next(error);
//     });
// };

// exports.getInvoice = (req, res, next) => {
//   const orderId = req.params.orderId;

//   Order.findById(orderId)
//     .then((order) => {
//       if (!order) {
//         return next(new Error("No order is found"));
//       }

//       if (order.user.userId.toString() !== req.user._id.toString()) {
//         return next(new Error("Not authorised"));
//       }

//       const invoiceName = "invoice-" + orderId + ".pdf";
//       const invoicePath = path.join("data", "invoices", invoiceName);

//       const pdfDoc = new PDFDocument();
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         "inline; filename=" + invoiceName + '"'
//       );
//       pdfDoc.pipe(fs.createWriteStream(invoicePath));
//       pdfDoc.pipe(res);

//       pdfDoc.fontSize(26).text("Invoice", {
//         underline: true,
//       });

//       pdfDoc.text("--------------------------");
//       let TotalPrice = 0;
//       order.products.forEach((prod) => {
//         TotalPrice = TotalPrice + prod.quantity * prod.product.price;

//         pdfDoc
//           .fontSize(14)
//           .text(
//             prod.product.title +
//               "---" +
//               " " +
//               prod.quantity +
//               +"  " +
//               "x" +
//               " " +
//               "$" +
//               prod.product.price
//           );
//       });
//       pdfDoc.fontSize(26).text("-----------------");
//       pdfDoc.fontSize(20).text("Total Price : $" + TotalPrice);
//       pdfDoc.end();
//     })
//     .catch((err) => {
//       return next(err);
//     });
// };
