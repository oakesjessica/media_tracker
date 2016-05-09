var express = require("express");
var bodyParser = require("body-parser");
var passport = require('passport');
var session = require('express-session');
var pg = require('pg');
var localStrategy = require('passport-local').Strategy;
var index = require("./routes/index");

var app = express();

var encryptLib = require('../modules/encryption');
var connectionString = 'postgres://localhost:5432/book_tracker';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("server/public"));

//  Passport Configuration
app.use(session({
  secret : "secret",
  resave : true,
  saveUninitialized : false,
  cookie : { maxAge : 300000, secure : false }
}));  //  app.use(session)

//  Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

//  Passport
passport.use("local", new localStrategy(
  {
  passReqToCallback : true,
  usernameField : "email"
  },
  function(req, email, password, done) {
    console.log("called local");
    pg.connect(connectionString, function(err, client) {
      if (err) {
        console.log(err);
      } else {
        console.log("called local - pg");

        var user = null;
        var query = client.query("SELECT * FROM users WHERE email = $1", [email]);

        query.on("row", function(row) {
          user = row;
        }); //  query.on("row")

        query.on("end", function() {
          if (user) {
            if (encryptLib.comparePassword(password, user.password)) {
              console.log("User match found in database.");
              done(null, user);
            } else {
              done(null, false, { message : "Incorrect email and password." });
            }
          } else {
            done(null, false, { message : "Incorrect email and password." });
          }
          client.end();
        }); //  query.on("end")
      } //  else
    }); //  pg.connect
  } //  function
)); //  passport.use("local")

//  Serialize user
passport.serializeUser(function(user, done) {
  console.log("Hit serializeUser");
  done(null, user.id);
});

//  Deserialize user
passport.deserializeUser(function(id, done) {
  console.log("called deserializeUser");
  pg.connect(connectionString, function(err, client) {
    if (err) {
      console.log(err);
    } else {
      var user = {};
      console.log("called deserializeUser - pg");

      var query = client.query("SELECT * FROM users WHERE id = $1", [id]);

      query.on("row", function(row) {
        console.log("User row", row);
        user = row;
        done(null, user);
      });

      //  After data is returned, close connection and return results
      query.on("end", function() {
        client.end();
      });
    } //  else
  }); //  pg.connect
}); //  passport.deserializeUser

//  Routers
app.use("/", index);

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log("Listening on port", port, ". Ctrl-C to exit.");
});
