const express = require("express");
const router = express.Router();
//get models
const Pages = require("../models/page");
//get home page(entry point)
router.get("/", (req, res) => {
  Pages.findOne({ slug: "home" }, (err, page) => {
    if (err) return console.log(err);
    res.render("index", {
      title: page.title,
      content: page.content,
    });
  });
});
//get a particular page
router.get("/:slug", (req, res) => {
  var slug = req.params.slug;
  Pages.findOne({ slug: slug }, (err, page) => {
    if (err) return console.log(err);
    if (!page) res.redirect("/");
    else {
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    }
  });
});
module.exports = router;
