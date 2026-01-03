const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { MailtrapTransport } = require("mailtrap");
const Nodemailer = require("nodemailer");

const Token = "b01b68f6fe7b18ad26b78db594df1187";

const t1 = "70d6d9da04664ffb6f1ebbde3a600e4a";
const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: Token,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

const recipients = ["chauhanvijay0908@gmail.com"];

transport
  .sendMail({
    from: sender,
    to: recipients,
    subjects: "you are awesome ",
    text: "congrats for sending the email ",
    category: "Integration test",
  })
  .then(console.log, console.error);

exports.getLogin = (req, res, next) => {
  // const isLoggedIn =
  //   req.get("Cookie").split(";")[1].trim().split("=")[1] === "true";
  //console.log(req.session.user);
  //console.log(req.session.isLoggedIn);
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "login",
    errorMessage: message,
  });
};
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
          }
        })
        //the above then dont cofirm that the password we are compare is actually match or not it return true whether is matched or not
        .catch((err) => {
          console.log("error in authentication ", error);
        });
    })
    .catch((err) => {
      console.log("error in my use function in admin.js", err);
    });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "email already exist, Please pick different one");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })

    .catch((err) => {
      console.log(err);
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
