const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeimg = require("resize-img");
const path = require("path");
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;
//get product model
const Products = require("../models/product");
//get catogery model
const Catogeries = require("../models/catogery");
//get products
router.get("/", (req, res) => {
  var count = 0;
  Products.countDocuments((err, c) => {
    count = c;
  });
  Products.find({})
    .sort({ sorting: 1 })
    .exec((err, products) => {
      if (err) return console.log(err);
      res.render("admin/products", {
        products: products,
        count: count,
      });
    });
});
//get add product
router.get("/add-product", (req, res) => {
  var title = "";
  var desc = "";
  var price = "";
  Catogeries.find((err, catogeries) => {
    res.render("admin/add-product", {
      title: title,
      desc: desc,
      catogeries: catogeries,
      price: price,
    });
  });
});
//post add product
router.post("/add-product", (req, res) => {
  var imageFile =
    typeof req.files.image !== "undefined" ? req.files.image.name : "";
  req.checkBody("price", "Price must have a value").isDecimal();
  req.checkBody("image", "You must upload an image").isImage(imageFile);
  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var catogery = req.body.catogery;
  var price = req.body.price;
  var errors = req.validationErrors();
  if (errors) {
    console.log("it has error");
  }

  Products.findOne({ slug: slug }, (err, product) => {
    if (product) {
      req.flash("danger", `${slug} Product already exists, Choose another.`);
      Catogeries.find((err, catogeries) => {
        res.render("admin/add-product", {
          title: "",
          desc: desc,
          catogeries: catogeries,
          price: price,
        });
      });
    } else {
      var price2 = parseFloat(price).toFixed(2);
      var product = new Products({
        title: title,
        slug: slug,
        desc: desc,
        catogery: catogery,
        price: price2,
        image: imageFile,
        sorting: 1000,
      });
      product.save(async (err) => {
        if (err) console.log("saving " + err);
        await mkdirp("public/product-images/" + product._id).then((data) => {
          console.log("1. creating " + data);
        });
        await mkdirp("public/product-images/" + product._id + "/gallery").then(
          (data) => {
            console.log("2. creating " + data);
          }
        );
        await mkdirp(
          "public/product-images/" + product._id + "/gallery/thumbs"
        ).then((data) => {
          console.log("3. creating " + data);
          if (imageFile != "") {
            var productImage = req.files.image;
            var datapath = path.resolve(
              __dirname +
                "/../public/product-images/" +
                product._id +
                "/" +
                imageFile
            );
            productImage.mv(datapath, (err) => {
              return console.log("img saving " + err);
            });
          }
        });

        req.flash("success", `${title} Product added successfully.`);
        console.log(`${title} Product added successfully.`);
        res.redirect("/admin/products");
      });
    }
  });
});
//get edit page
router.get("/edit-product/:id", (req, res) => {
  var errors;
  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;
  Products.findOne({ _id: req.params.id }, (err, product) => {
    if (err) console.log(err);
    console.log(`${product.slug} edit product page`);
    Catogeries.find((err, catogeries) => {
      if (err) return console.log(err);
      else {
        var gallerydir = "public/product-images/" + product._id + "/gallery";
        var galleryimages = null;
        fs.readdir(gallerydir, (err, files) => {
          if (err) return console.log(err);
          else {
            galleryimages = files;
            res.render("admin/edit-product", {
              title: product.title,
              errors: errors,
              desc: product.desc,
              catogeries: catogeries,
              catogery: product.catogery,
              price: product.price,
              image: product.image,
              galleryimages: galleryimages,
              id: product._id,
            });
          }
        });
      }
    });
  });
});
//post edit page
router.post("/edit-product", (req, res) => {
  var imageFile =
    typeof req.files.image != "undefined" ? req.files.image.name : "";
  req.checkBody("price", "Price must have a value").isDecimal();
  // req.checkBody("image", "You must upload an image").isImage(imageFile);
  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var catogery = req.body.catogery;
  var price = req.body.price;
  var id = req.body.id;
  var pimage = req.body.pimage;
  var errors = req.validationErrors();
  if (errors) {
    console.log("it has error");
    req.session.errors = errors;
    res.redirect("/admin/products/edit-product/" + id);
  } else {
    Products.findOne({ slug: slug, _id: { $ne: id } }, (err, product) => {
      if (err) console.log(err);
      if (product) {
        req.flash("danger", `${slug} Product already exists, Choose another.`);
        res.redirect("/admin/products/edit-product/" + id);
      } else {
        Products.findById({ _id: id }, (err, product) => {
          if (err) console.log(err);
          product.title = title;
          product.slug = slug;
          product.desc = desc;
          product.price = parseFloat(price).toFixed(2);
          product.catogery = catogery;
          if (imageFile !== "") {
            product.image = imageFile;
          }
          product.save((err) => {
            if (err) console.log(err);
            if (imageFile != "") {
              if (pimage != "") {
                fs.remove(
                  "public/product-images/" + id + "/" + pimage,
                  (err) => {
                    if (err) console.log(err);
                  }
                );
              }
              var productImage = req.files.image;
              var datapath = path.resolve(
                __dirname + "/../public/product-images/" + id + "/" + imageFile
              );
              productImage.mv(datapath, (err) => {
                return console.log("img saving " + err);
              });
            }
            req.flash("success", `${title} Product edited successfully.`);
            console.log(`${title} Product edited successfully.`);
            res.redirect("/admin/products/edit-product/" + id);
          });
        }); //
      }
    });
  }
});
//post product-gallery
router.post("/edit-product/admin/products/product-gallery/:id", (req, res) => {
  var productImage = req.files.file;
  var id = req.params.id;
  var imgpath =
    "public/product-images/" + id + "/gallery/" + req.files.file.name;
  var thumbspath =
    "public/product-images/" + id + "/gallery/thumbs/" + req.files.file.name;
  productImage.mv(imgpath, (err) => {
    if (err) console.log(err);
    resizeimg(fs.readFileSync(imgpath), { width: 100, height: 100 }).then(
      (buf) => {
        fs.writeFileSync(thumbspath, buf);
      }
    );
    req.flash("success", `Gallery added successfully.`);
  });
  res.sendStatus(200);
});
//delete product-gallery image
router.get("/delete-image/:image", (req, res) => {
  var id = req.query.id;
  var imgpath = "public/product-images/" + id + "/gallery/" + req.params.image;
  var thumbspath =
    "public/product-images/" + id + "/gallery/thumbs/" + req.params.image;
  fs.remove(imgpath, (err) => {
    if (err) return console.log(err);
    fs.remove(thumbspath, (err) => {
      if (err) return console.log(err);
      res.redirect("/admin/products/edit-product/" + id);
    });
  });
});
//delete product
router.get("/delete-product/:id", (req, res) => {
  Products.findByIdAndDelete({ _id: req.params.id }, (err, product) => {
    if (err) console.log(err);
    fs.remove("public/product-images/" + product._id, (err) => {
      if (err) console.log(err);
    });
    req.flash("danger", `${product.title} deleted successfully`);
    res.redirect("/admin/products");
  });
});
//exports
module.exports = router;
