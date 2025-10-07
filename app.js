const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// app.use("/", (req, res, next) => {
//   console.log("this always run");
//   next();
// });

const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");
app.use("/admin", adminRoute);
app.use(shopRoute);

app.use("/", (req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000);
