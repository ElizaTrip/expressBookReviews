const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const userInList = users.filter((user) => {
        return user.username === username
    });
    if (userInList.length > 0){
        return true;
    }
    else {
        return false;
    }
}

regd_users.post("/register", (req,res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password){
      if (isValid(username)){
          return res.status(404).json({message: "User already exists!"});
      }
      else {
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registred. Now you can login"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
  });


const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validUsers = users.filter((user) => {
    return (user.username === username  && user.password === password )
});
if (validUsers.length > 0){
    return true;
}
else {
    return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }
  
  if (authenticatedUser(username, password)){
    let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const selectedBook = books[isbn];

  if (selectedBook){
    const username = req.session.authorization.username;
    const reviewText = req.body.review;

    if (!reviewText){
        return res.status(400).json({message: "Review not provided."})
    }
    else {
        selectedBook.reviews = {
            "username": username, 
            "review": reviewText    
        };        
    }
  }

  return res.status(200).json({message: "Sucsessfully added."});
});


regd_users.delete("/auth/review/:isbn", (req, res) =>{
  const isbn = req.params.isbn;
  const bookReviews = books[isbn].reviews;
  
  if (!bookReviews){
      return res.status(400).json({message: "No reviews found"});
  }
  
  const username = req.session.authorization.username;
  for (const review in bookReviews){
      console.log(review);        if (review==username){
          delete bookReviews[review];
          return res.status(200).json({message: "Deleted!"});
      }

  }
  return res.status(400).json({message: "You haven't left review yet."});

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
