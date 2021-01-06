exports.isUser = (req, res, next) => {
  if (req.isAuthenticated) {
    next();
  } else {
    req.flash("danger", "Please LogIn !");
    res.redirect("/users/login");
  }
};
exports.isAdmin = (req, res, next) => {
  res.locals.user.admin=null;
  if (req.isAuthenticated && res.locals.user.admin == 0) {
    next();
  } else {
    req.flash("danger", "Please LogIn as Admin !");
    res.redirect("/users/login");
  }
};
