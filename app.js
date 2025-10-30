const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
//const expressHbs = require("express-handlebars");
const app = express();

// app.set("view engine", "pug");
//usig handlebars as a engine
// app.engine(
//   "hbs",
//   expressHbs.engine({
//     extname: ".hbs",
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layouts",
//   })
// );
app.set("view engine", "ejs");
// app.set("view engine", "pug");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const error = require("./controllers/error");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(error.get404);

app.listen(3000);
