const Razorpay = require("razorpay");
require("dotenv").config({ path: __dirname + "/.env" });

exports.razorpay = new Razorpay({
  key_id: process.env.rzKey,
  pass: process.env.rzPass,
});
