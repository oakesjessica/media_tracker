var router = require("express").Router();
var pg = require("pg");

var connectionString = "postgres://localhost:5432/book_tracker";

router.get("/", function(req, res) {
  var userInfo = req.user;

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      var results = [];
      client.query("SELECT users_books.id, books.id AS bookID, books.title, " + "books.series, books.author, books.languages, books.published, books.locations, " +
      "users.first_name, users.last_name FROM books " +
      "JOIN users_books ON books.id = users_books.book_id " +
      "JOIN users ON users_books.user_id = users.id WHERE users.id = $1;", [userInfo.id], function(err, result) {
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
