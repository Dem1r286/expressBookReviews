const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    users.push({ username, password });

    return res.status(201).json({ message: 'Registered user successfully. Now you can log in' });
});

function getBookList() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(Object.values(books));
        } else {
            reject(new Error('Unable to fetch book list'));
        }
    });
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBookList()
        .then(books => {
            const jsonBooks = JSON.stringify(books, null, 2);
            res.set('Content-Type', 'application/json');
            res.status(200).send(jsonBooks);
        })
        .catch(error => {
            res.status(500).send('Error fetching book list: ' + error.message);
        });
});

public_users.get('/isbn/:isbn', function (req, res) {
    getBookDetails(isbn)
        .then(bookDetails => {
            if (bookDetails) {
                res.status(200).json(bookDetails);
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Error fetching book details: ' + error.message });
        });
});

function getBookDetails(isbn) {
    return new Promise((resolve, reject) => {
        const bookDetails = books[isbn];

        if (bookDetails) {
            resolve(bookDetails);
        } else {
            reject(new Error('Book details not found for ISBN: ' + isbn));
        }
    });
}



public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then(booksByAuthor => {
            if (booksByAuthor.length > 0) {
                res.status(200).json(booksByAuthor);
            } else {
                res.status(404).json({ message: 'No books found for the author' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Error fetching books by author: ' + error.message });
        });
});


function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const booksByAuthor = [];

        Object.values(books).forEach(book => {
            if (book.author.toLowerCase() === author.toLowerCase()) {
                booksByAuthor.push(book);
            }
        });

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject(new Error('No books found for the author: ' + author));
        }
    });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase().replace(/\s/g, '');
    getBooksByTitle(title)
        .then(booksByTitle => {
            if (booksByTitle.length > 0) {
                res.status(200).json(booksByTitle);
            } else {
                res.status(404).json({ message: 'No books found for the title' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Error fetching books by title: ' + error.message });
        });
});

function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const booksByTitle = [];
        Object.values(books).forEach(book => {
            const bookTitle = book.title.toLowerCase().replace(/\s/g, '');
            if (bookTitle === title) {
                booksByTitle.push(book);
            }
        });

        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject(new Error('No books found for the title: ' + title));
        }
    });
}

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});



module.exports.general = public_users;