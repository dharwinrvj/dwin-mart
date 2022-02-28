//admin-login
//username-admin
//password-dharwin
//imports
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv/config");
const path = require("path");
const session = require("express-session");
const expressValidator = require("express-validator");
const fileupload = require("express-fileupload");
const passport = require("passport");
// routes
const pages = require("./routes/pages");
const admincatogeries = require("./routes/admincatogeries");
const adminproducts = require("./routes/adminproducts");
const adminpages = require("./routes/adminpages");
const products = require("./routes/product");
const cart = require("./routes/cart");
const users = require("./routes/users");
// get models
const Pages = require("./models/page");
const Catogeries = require("./models/catogery");
//view engine set-up
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//set global variable
app.locals.errors = null;
app.locals.cart = null;
app.locals.user = null;
app.locals.pages = null;
//global variables
//get all pages to pass to header.ejs
Pages.find({})
  .sort({ sorting: 1 })
  .exec((err, pages) => {
    if (err) return console.log(err);
    app.locals.pages = pages;
  });
//get all catogeries to pass to header.ejs
Catogeries.find({})
  .sort({ sorting: 1 })
  .exec((err, catogeries) => {
    if (err) return console.log(err);
    app.locals.catogeries = catogeries || null;
  });
//middleware
app.use(morgan("dev"));
//static folder middleware
app.use(express.static(path.join(__dirname, "public")));
//bodyparser - middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
//express fileupload middleware
app.use(fileupload());
//express session middleware
//https://github.com/expressjs/session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);
//express validator middleware - npm install express-validator@5.3.1 --save-exact
//https://github.com/VojtaStavik/GetBack2Work-Node/tree/master/node_modules/express-validator
// In this example, the formParam value is going to get morphed into form body format useful for printing.
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);
//express message middleware
//https://github.com/visionmedia/express-messages
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
//passport-config
require("./config/passport")(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//cart
app.get("*", (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user;
  next();
});
//router-config
app.use("/admin/pages", adminpages);
app.use("/admin/catogeries", admincatogeries);
app.use("/admin/products", adminproducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/users", users);
app.use("/", pages);
//router
//home
app.get("/", (req, res) => {
  res.render("index");
});
//server
const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log("application is started " + port);
});
//database connection
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
//local db
/*
mongoose.connect("mongodb://localhost:27017/dmart", (err) => {
  if (err) throw err;
  console.log("DB connected");
});
*/
//remote db
mongoose.connect(
  "mongodb+srv://dharwin:9715928749@dharwin.wkbz4.mongodb.net/dmart?retryWrites=true&w=majority",
  (err) => {
    if (err) throw err;
    console.log("DB connected");
  }
);
