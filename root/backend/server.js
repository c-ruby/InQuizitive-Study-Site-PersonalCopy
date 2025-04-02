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
const levenshtein = require('fast-levenshtein');


//create instances and constants
const bodyParser = require('body-parser'); 
const app = express();
const port = process.env.PORT || 3001;

// create MySQL Connection from environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 30000
});


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

//middleware to parse JSON communications from front-end 
app.use(bodyParser.json());

// Import and use the routes
require('./studySetRoutes')(app, db);
require('./userRoutes')(app, db);
require('./searchRoutes')(app, db);






/*
Starting the server, database connection, and serving static files 
*/

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

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('MySQL Connected...');
});



// Start the server
app.listen(port, () => {
  console.log(`Server started successfully on port: ${port}`);
});







