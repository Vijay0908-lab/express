exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader("set-Cookie", "isLoggedIn=true");
  res.redirect("/");
};
