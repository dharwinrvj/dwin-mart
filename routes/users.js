const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport");
//get models
const Users = require("../models/user");
//get register
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});
//get login
router.get("/login", (req, res) => {
  res.render("login", {
    title: "LogIn",
  });
});
//post register
router.post("/register", (req, res) => {
  var name = req.body.name;
  var email = req.body.mail;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.cpassword;
  req.checkBody("password", "Password do not match !").equals(password2);
  var errors = req.validationErrors();
  console.log(errors);
  if (errors) {
    console.log(errors);
    res.render("register", {
      title: "Register",
      user: null,
      errors: errors,
    });
  } else {
    Users.findOne({ username: username }, (err, user) => {
      if (err) console.log(errors);
      if (user) {
        req.flash("danger", "User Name already exists, Choose another !");
        res.redirect("/users/register");
      } else {
        var user = new Users({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 1,
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) console.log(err);
            user.password = hash;
            user.save((err) => {
              if (err) return console.log(err);
              req.flash("success", "You are Registered successfully !");
              res.redirect("/users/login");
            });
          });
        });
      }
    });
  }
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});
router.get("/logout", (req, res) => {
  delete req.session.cart;
  req.logout();
  req.flash("success", "You are Logged Out !");
  res.redirect("/users/login");
});
//exports
module.exports = router;
