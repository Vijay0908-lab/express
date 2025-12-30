const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // const isLoggedIn =
  //   req.get("Cookie").split(";")[1].trim().split("=")[1] === "true";
  console.log(req.session.user);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("695031a00a1b3435d124e905")
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      res.redirect("/");
    })
    .catch((err) => {
      console.log("error in my use function in admin.js", err);
    });
};
