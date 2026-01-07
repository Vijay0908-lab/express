const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Invalid email or password")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("Enter valid email or password");
          }
        });
      }),
  ],
  authController.postLogin
);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        //   if (value !== req.body.password) {
        //     throw new Error("Passwords have to match");
        //   }
        //   return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      }),
    body("password", "Please a password with atleast 5 character")
      .isLength({ min: 5, max: 12 })
      .isAlphanumeric(),
    body("confirmPassword", "Please enter matching password")
      .isLength({ min: 5, max: 12 })
      .isAlphanumeric(),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword); //this is dynamic parameter using the url

router.post("/new-password", authController.postNewpassword);
module.exports = router;
