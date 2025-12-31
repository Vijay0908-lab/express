const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // const isLoggedIn =
  //   req.get("Cookie").split(";")[1].trim().split("=")[1] === "true";
  //console.log(req.session.user);
  //console.log(req.session.isLoggedIn);
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
      req.session.save((err) => {
        if (err) {
          console.log("error while saving ", err);
        }
        res.redirect("/");
      });
      //req.session.res.redirect("/"); the purpose for save is that so that session is first save then only it redirect to the "/"
    })
    .catch((err) => {
      console.log("error in my use function in admin.js", err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
