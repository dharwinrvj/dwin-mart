const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
//get product model
const Products = require("../models/product");
//get catogery model
const Catogeries = require("../models/catogery");
//get all products
router.get("/", (req, res) => {
  Products.find((err, products) => {
    if (err) return console.log(err);
    res.render("all-products", {
      title: "All Products",
      products: products,
    });
  });
});
//get all products by catogery
router.get("/:catogery", (req, res) => {
  var catogery = req.params.catogery;
  Catogeries.findOne({ slug: catogery }, (err, catogery) => {
    if (err) return console.log(err);
    Products.find({ catogery: req.params.catogery }, (err, products) => {
      if (err) return console.log(err);
      res.render("all-products", {
        title: catogery.title,
        products: products,
      });
    });
  });
});
//view a product
router.get("/:catogery/:slug", (req, res) => {
  var catogery = req.params.catogery;
  var slug = req.params.slug;
  var loggedin = req.isAuthenticated() ? true : false;
  Products.findOne({ slug: slug }, (err, product) => {
    if (err) return console.log(err);
    var gallerydir = "public/product-images/" + product._id + "/gallery";
    var galleryimages = null;
    fs.readdir(gallerydir, (err, files) => {
      if (err) return console.log(err);
      else {
        galleryimages = files;
        res.render("view-product", {
          title: product.title,
          product: product,
          galleryimages: galleryimages,
          loggedin: loggedin,
        });
      }
    });
  });
});
//exports
module.exports = router;
