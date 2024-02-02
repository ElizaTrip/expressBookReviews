const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password){
    const userInList = users.filter((user) => {
        return user.username === username
    });
    if (userInList.length > 0){
        return res.status(404).json({message: "User already exists!"});
    }
    else {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const getAllBooks = new Promise((resolve) => 
  {
    return res.send(JSON.stringify(books, null, 4));
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const getBookBIsbn = new Promise((resolve, reject) => {
      const isnb = req.params.isbn;
      let book = books[isnb];
      if  (book){
          resolve(res.send(JSON.stringify(book, null, 4)))
      }
      
  }).catch(res.json({message:"No book found!"}))
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  let author_books = [];
  const booksByAuthor = new Promise((resolve, reject) => 
  {
    for (const book in books){
        if (author === books[book].author){
            author_books.push(books[book]);
        }
      }
      if (author_books){
        resolve(res.send(JSON.stringify(author_books, null, 4)))
      }
  })
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const getByTitle = new Promise((resolve) => {
    for (const book in books){
        if (title === books[book].title){
            resolve(res.send(JSON.stringify(books[book], null, 4)))
        }
      }    
  })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const selected_book = books[isbn];
  return res.send(JSON.stringify(selected_book.reviews, null, 4));
});

module.exports.general = public_users;