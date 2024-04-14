const express = require('express');
const books = require("./booksdb.js");
const { isValid } = require("./auth_users.js");
const { users } = require("./auth_users.js");
const axios = require('axios');

const public_users = express.Router();
const BASE_URL = 'http://localhost:5000'; // Modify according to your server configuration

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username is already taken." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/books`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/api/books/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found", error: error.message });
  }
});

public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/api/books/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for this author", error: error.message });
  }
});

public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/api/books/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found with this title", error: error.message });
  }
});

public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  book ? res.status(200).json(book.reviews) : res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
