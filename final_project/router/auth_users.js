const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

const isValid = username => users.some(u => u.username === username);

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username && u.password === password);
  return user ? jwt.sign({ username: user.username }, "your_jwt_secret", { expiresIn: '1h' }) : null;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const token = authenticatedUser(username, password);
  if (token) {
    return res.status(200).json({ message: "Logged in successfully", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;
  const { isbn } = req.params;

  if (books[isbn]) {
    if (!books[isbn].reviews[req.user.username]) {
      books[isbn].reviews[req.user.username] = [];
    }
    books[isbn].reviews[req.user.username].push(review);
    return res.status(200).json({ message: "Review added successfully", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user.username; // Extract username from JWT payload set during authentication

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]; // Delete the review made by the user
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "No review by user found for this book" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
