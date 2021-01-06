const express = require("express");
const router = express.Router();
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;
//get catogery model
const Catogeries = require("../models/catogery");
//get catogeries
router.get("/", isAdmin, (req, res) => {
  Catogeries.find({})
    .sort({ sorting: 1 })
    .exec((err, catogeries) => {
      if (err) return console.log(err);
      res.render("admin/catogeries", {
        catogeries: catogeries,
      });
    });
});
//get add catogeries
router.get("/add-catogery", isAdmin, (req, res) => {
  var title = "";
  var slug = "";
  res.render("admin/add-catogery", {
    title: title,
    slug: slug,
  });
});
//post add catogeries
router.post("/add-catogery", (req, res) => {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  Catogeries.findOne({ slug: slug }, (err, catogery) => {
    if (catogery) {
      req.flash("danger", `${slug} Catogery already exists, Choose another.`);
      res.render("admin/add-catogery", {
        title: title,
        slug: "",
      });
    } else {
      var catogery = new Catogeries({
        title: title,
        slug: slug,
        sorting: 100,
      });
      catogery.save((err) => {
        if (err) console.log(err);
        //get all catogeries to pass to header.ejs
        Catogeries.find({})
          .sort({ sorting: 1 })
          .exec((err, catogeries) => {
            if (err) return console.log(err);
            req.app.locals.catogeries = catogeries;
          });
        req.flash("success", `${title} Catogery added successfully.`);
        console.log(`${title} Catogery added successfully.`);
        res.redirect("/admin/catogeries");
      });
    }
  });
});
//reorder catogeries
router.post("/reorder-catogeries", (req, res) => {
  var ids = req.body.id;
  console.log(ids);
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    ((count) => {
      Catogeries.findById(id, async (err, catogery) => {
        catogery.sorting = await count;
        catogery.save((err) => {
          if (err) console.log(err);
          //get all catogeries to pass to header.ejs
          Catogeries.find({})
            .sort({ sorting: 1 })
            .exec((err, catogeries) => {
              if (err) return console.log(err);
              req.app.locals.catogeries = catogeries;
            });
          console.log("successfully reordered");
        });
      });
    })(count);
  }
});
//get edit catogery
router.get("/edit-catogery/:slug", isAdmin, (req, res) => {
  Catogeries.findOne({ slug: req.params.slug }, (err, catogery) => {
    if (err) console.log(err);
    console.log(`${req.params.slug} edit catogery page`);
    res.render("admin/edit-catogery", {
      title: catogery.title,
      slug: catogery.slug,
      id: catogery._id,
    });
  });
});
//post edit catogery
router.post("/edit-catogery", (req, res) => {
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  var title = req.body.title;
  Catogeries.findOne(
    { slug: slug, _id: { $ne: req.body.id } },
    (err, catogery) => {
      if (err) console.log(err);
      if (catogery) {
        req.flash("danger", `${slug} Catogery already exists, Choose another.`);
        res.render("admin/edit-catogery", {
          title: title,
          slug: "",
          id: catogery._id,
        });
      } else {
        Catogeries.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              title: title,
              slug: slug,
            },
          },
          (err) => {
            if (err) console.log(err);
            //get all catogeries to pass to header.ejs
            Catogeries.find({})
              .sort({ sorting: 1 })
              .exec((err, catogeries) => {
                if (err) return console.log(err);
                req.app.locals.catogeries = catogeries;
              });
            req.flash("success", `${title} Catogery edited successfully.`);
            console.log(`${title} successfully edited`);
            res.redirect("/admin/catogeries");
          }
        );
      }
    }
  );
});
//delete catogery
router.get("/delete-catogery/:id", isAdmin, (req, res) => {
  Catogeries.findByIdAndDelete({ _id: req.params.id }, (err, catogery) => {
    if (err) console.log(err);
    //get all catogeries to pass to header.ejs
    Catogeries.find({})
      .sort({ sorting: 1 })
      .exec((err, catogeries) => {
        if (err) return console.log(err);
        req.app.locals.catogeries = catogeries;
      });
    req.flash("danger", `${catogery.title} deleted successfully`);
    res.redirect("/admin/catogeries");
  });
});
//exports
module.exports = router;
