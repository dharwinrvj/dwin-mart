const LocalStrategy = require("passport-local").Strategy;
const Users = require("../models/user");
const bcrypt = require("bcryptjs");
//exports
module.exports = (passport) => {
  passport.use(
    new LocalStrategy((username, password, done) => {
      Users.findOne({ username: username }, (err, user) => {
        if (err) console.log(err);
        if (!user) {
          return done(null, false, { message: "No User Found !" });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) console.log(err);
          if (isMatch) return done(null, user);
          else return done(null, false, { message: "Wrong Password !" });
        });
      });
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    Users.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
