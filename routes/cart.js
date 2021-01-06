const express = require("express");
const router = express.Router();
const path = require("path");
const product = require("../models/product");
//get models
const Products = require("../models/product");
//get add product cart
router.get("/add/:slug", (req, res) => {
  var slug = req.params.slug;
  Products.findOne({ slug: slug }, (err, product) => {
    if (err) return console.log(err);
    if (typeof req.session.cart == "undefined") {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: "/product-images/" + product._id + "/" + product.image,
      });
    } else {
      var cart = req.session.cart;
      var newItem = true;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }
      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: "/product-images/" + product._id + "/" + product.image,
        });
      }
    }
    console.log(req.session.cart);
    req.flash("success", "Product added !");
    res.redirect("back");
  });
});
//get checkout
router.get("/checkout", (req, res) => {
  res.render("checkout", {
    title: "Checkout",
    cart: req.session.cart,
  });
});
//update cart
router.get("/update/:slug", (req, res) => {
  var slug = req.params.slug;
  var cart = req.session.cart;
  var action = req.query.action;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "sub":
          cart[i].qty--;
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }
  req.flash("success", "Cart Updated !");
  res.redirect("back");
});
//clear cart
router.get("/clear", (req, res) => {
  delete req.session.cart;
  req.flash("danger", "Cart Cleared !");
  res.redirect("/cart/checkout");
});
//payment-success
router.get("/payment-success", (req, res) => {
  delete req.session.cart;
  res.render("payment-update", {
    title: "Success",
    content: "success",
  });
});
//payment-failed
router.get("/payment-failed", (req, res) => {
  res.render("payment-update", {
    title: "Failed",
    content: "failed",
  });
});
//exports
module.exports = router;
