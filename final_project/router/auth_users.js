const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
let books = require("./booksdb.js");

const regd_users = express.Router();
regd_users.use(bodyParser.json());

let users = [{"username":"alireza","password":"1234"}];

const isValid = (username) => {
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
}

const authenticatedUser = (username, password) => {
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

// Endpoint to validate and sign in a customer
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Missing username and password"});
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username: username }, 'your-secret-key', { expiresIn: '1h' });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ accessToken, message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

// Endpoint to add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (users.find(user => user.username === username)) {
    if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review successfully posted" });
    } else {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
});

// Endpoint to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (users.find(user => user.username === username)) {
    if (books[isbn]) {
      let book = books[isbn];
      delete book.reviews[username];
      return res.status(200).json({ message: "Review successfully deleted" });
    } else {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
