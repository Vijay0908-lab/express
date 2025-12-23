const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const User = require("./models/user");
const errorController = require("./controllers/error");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("694af841eabe530aa47a5ceb")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("error in my use function in admin.js", err);
    });
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://Vijay4944:Vijay4944@cluster0.9u1hgcw.mongodb.net/shop?appName=Cluster0"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "vijay",
          email: "vijay@gmail.com",
          carts: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
