// server/routes/shelves.js
var router = require("express").Router();
var pg = require("pg");

var connectionString = require('../../modules/dbconnection').connectionString;

router.get("/", function(req, res) {
  var userInfo = req.user;

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      console.log("Error connecting to PG shelves file", err);
      res.status(500).send(err);
    } else {
      var results = [];
      client.query("SELECT * " +
      "FROM books " +
      "JOIN book_shelves AS bshelf ON books.id = bshelf.book_id " +
      "JOIN shelves ON bshelf.shelf_id = shelves.id WHERE shelves.user_id = $1 " +
      "ORDER BY shelf_name ASC;", [userInfo.id], function(err, result) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
          process.exit(1);
        } else {
          res.send(result.rows);
          done();
        }
      });
    } //  else
  }); //  pg.connect
}); //  router.get

module.exports = router;
