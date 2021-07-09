const express = require("express");
const router = express.Router();
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;
//get page model
const Pages = require("../models/page");
//get pages
router.get("/", isAdmin, (req, res) => {
  Pages.find({})
    .sort({ sorting: 1 })
    .exec((err, pages) => {
      if (err) return console.log(err);
      res.render("admin/pages", {
        pages: pages,
      });
    });
});
//get add pages
router.get("/add-page", isAdmin, (req, res) => {
  var title = "";
  var slug = "";
  var content = "";
  res.render("admin/add-page", {
    title: title,
    slug: slug,
    content: content,
  });
});
//post pages
router.post("/add-page", (req, res) => {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;
  Pages.findOne({ slug: slug }, (err, page) => {
    if (page) {
      req.flash("danger", `${slug} Page already exists, Choose another.`);
      res.render("admin/add-page", {
        title: title,
        slug: "",
        content: content,
      });
    } else {
      var page = new Pages({
        title: title,
        slug: slug,
        content: content,
        sorting: 100,
      });
      page.save((err) => {
        if (err) console.log(err);
        //get all pages to pass to header.ejs
        Pages.find({})
          .sort({ sorting: 1 })
          .exec((err, pages) => {
            if (err) return console.log(err);
            res.locals.pages = pages;
          });
        req.flash("success", `${title} Page added successfully.`);
        console.log(`${title} Page added successfully.`);
        res.redirect("/admin/pages");
      });
    }
  });
});
//reorder pages
router.post("/reorder-pages", (req, res) => {
  var ids = req.body.id;
  console.log(ids);
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    ((count) => {
      Pages.findById(id, async (err, page) => {
        page.sorting = await count;
        page.save((err) => {
          if (err) console.log(err);
          //get all pages to pass to header.ejs
          Pages.find({})
            .sort({ sorting: 1 })
            .exec((err, pages) => {
              if (err) return console.log(err);
              res.locals.pages = pages;
            });
          console.log("successfully reordered");
        });
      });
    })(count);
  }
});
//get edit page
router.get("/edit-page/:slug", isAdmin, (req, res) => {
  Pages.findOne({ slug: req.params.slug }, (err, page) => {
    if (err) console.log(err);
    console.log(`${req.params.slug} edit page`);
    res.render("admin/edit-page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id,
    });
  });
});
//post edit page
router.post("/edit-page", (req, res) => {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;
  Pages.findOne({ slug: slug, _id: { $ne: req.body.id } }, (err, page) => {
    if (page) {
      req.flash("danger", `${slug} Page already exists, Choose another.`);
      res.render("admin/edit-page", {
        title: title,
        slug: "",
        content: content,
        id: page._id,
      });
    } else {
      Pages.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            title: title,
            slug: slug,
            content: content,
          },
        },
        (err) => {
          if (err) console.log(err);
          //get all pages to pass to header.ejs
          Pages.find({})
            .sort({ sorting: 1 })
            .exec((err, pages) => {
              if (err) return console.log(err);
              res.locals.pages = pages;
            });
          req.flash("success", `${title} Page edited successfully.`);
          console.log(`${title} successfully edited`);
          res.redirect("/admin/pages");
        }
      );
    }
  });
});
//delete catogery
router.get("/delete-page/:id", isAdmin, (req, res) => {
  Pages.findByIdAndDelete({ _id: req.params.id }, (err, page) => {
    if (err) console.log(err);
    //get all pages to pass to header.ejs
    Pages.find({})
      .sort({ sorting: 1 })
      .exec((err, pages) => {
        if (err) return console.log(err);
        res.locals.pages = pages;
      });
    req.flash("danger", `${page.title} deleted successfully`);
    res.redirect("/admin/pages");
  });
});
//exports
module.exports = router;
