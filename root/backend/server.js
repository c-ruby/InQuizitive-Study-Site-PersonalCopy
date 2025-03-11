/*
~~~~~~~~~~Initialization~~~~~~~~~~
*/
// Change the working directory to the root of the repository
const path = require('path');
process.chdir(path.resolve(__dirname, '../../'));



// Load environment variables from .env file
require('dotenv').config(); 


//Requirements 
const session = require('express-session'); //allows for 'sessions'
const bcrypt = require('bcrypt'); //for password hashing
const express = require('express');  //middle-ware: serves front, handles communication to back 
const mysql = require('mysql2');  //database features


//create instances and constants
const bodyParser = require('body-parser'); 
const app = express();
const port = process.env.PORT || 3001;

// Use sessions to track user login status
app.use(session({
  secret: process.env.SESSION_SECRET,
  /*
    this will be kept in the environment variables for security pracices, even if we don't really expect any attacks 

    can be thought of as a random seed and a password: 
      ensures constistency by creating a digital signature for the session ID cookie
  */
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to 'true' when we use HTTPS
}));

/*
// Debugging output to check the current working directory and environment variables
console.log('Current Working Directory:', process.cwd());
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME); 
*/


//middleware to parse JSON communications from front-end 
app.use(bodyParser.json());



/*
~~~~~~~~~~Functions and routes~~~~~~~~~~
*/

// Serve static files from the 'frontend' directory
// Serve static files from the "frontend" directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/html')));
app.use(express.static(path.join(__dirname, '../frontend/css')));
app.use(express.static(path.join(__dirname, '../frontend/js')));
/*
  path.join() creates the file path using following parameters 
    __dirname gets current file directory
    '..' navigates back a directory
    'frontend' moves into frontend directory

  result: express serves static files (frontend) from the frontend directory
*/  

  // Start the server
  app.listen(port, () => {
    console.log(`Server started successfully on port: ${port}`);
  });
