const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!isValid(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    let bookList = Object.values(books).map(book => {
        return {
            author: book.author,
            title: book.title,
            isbn: book.isbn
        }
    })
    return res.status(200).send(JSON.stringify(bookList, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length === 0) {
        return res.status(404).json({ message: "Author not found" });
    }

    return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
       const title = req.params.title;

    const book = Object.values(books).find(book => book.title === title);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book.reviews);
});


module.exports.general = public_users;