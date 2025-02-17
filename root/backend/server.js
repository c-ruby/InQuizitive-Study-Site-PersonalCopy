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


// create MySQL Connection from environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  
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





// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('MySQL Connected...');
});

// Route to handle adding a new user account
app.post('/add-user', async (req, res) => 
{
  const { username, password } = req.body;  //creates constants for username and password from passed in request
  
  try 
  {
    const hashedPassword = await bcrypt.hash(password, 10);   //generates hashed password
    const query = 'INSERT INTO user_credentials (username, password) VALUES (?, ?)';  //creates query looking for username and password params
    db.query(query, [username, hashedPassword], (err, results) => //sends that query, receiving errors and results
    {
      if (err) //if an error is received from the db
      {
        console.error('Error inserting user credentials:', err);
        res.status(500).json({ error: 'Database error' });
      } 
      else 
      {
        res.status(200).json({ message: 'User credentials added successfully', userId: results.insertId });
      }
    });
  } catch (err) 
  {
    res.status(500).send('Server error');
  }
});

// Route to handle user login
app.post('/login', async (req, res) => 
{
  const { username, password } = req.body;
  const query = 'SELECT * FROM user_credentials WHERE username = ?'; //first queries to match entry with that username 
  db.query(query, [username], async (err, results) => 
  {
      if (err) 
      {
          return res.status(500).send('Server error');  //exits on error 
      }
      if (results.length === 0) 
      {
          return res.status(401).send('Invalid username or password');  //exits if no entry found 
      }
      const user = results[0];  //sets user to value of found username 
      const isPasswordValid = await bcrypt.compare(password, user.password);  //using the hashing library, compares input password to stored password 
      if (!isPasswordValid) {
      
          return res.status(401).send('Invalid username or password');  //if not valid, exits 
      }

      //after passing all those checks, a session is created, and the user is logged in, and success sent back to scripts in frontend
      req.session.user = user;
      res.send('Login successful');
  });
});


// Middleware to check if user is logged in
function checkAuth(req, res, next) {
  if (req.session.user) 
  {
      next(); //just making shure there's a session 
  } else {
      res.status(401).send('Unauthorized'); 
  }
}

// Route to check if user is authenticated
app.get('/check-auth', (req, res) => 
  {
  if (req.session.user) {
      res.json({ loggedIn: true, username: req.session.user.username });
  } else {
      res.json({ loggedIn: false });
  }
});


// User Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.clearCookie('connect.sid', { path: '/' }); // Clear the session cookie
    res.send('Logout successful');
  });
});


//change password route 
// Route to handle changing password
app.post('/change-password', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'UPDATE user_credentials SET password = ? WHERE username = ?';
    db.query(query, [hashedPassword, username], (err, results) => {
      if (err) {
        console.error('Error updating user password:', err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.status(200).json({ message: 'Password changed successfully' });
      }
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


//delete account route 
// Route to handle deleting account
// Route to handle deleting account
app.post('/delete-account', (req, res) => {
  if (!req.session.user.username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const username = req.session.user.username;

  console.log(`Attempting to delete account for user: ${username}`);

  const query = 'DELETE FROM user_credentials WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error deleting user account:', err);
      res.status(500).json({ error: 'Database error' });
    } 
    else if (results.affectedRows === 0) {
      console.warn(`No account found for user: ${username}`);
      res.status(404).json({ message: 'Account not found' });
    } 
    else {
      console.log(`Account for user ${username} deleted successfully`);
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.status(200).json({ message: 'Account deleted successfully' });
      });
    }
  });
});






/*    Have not touched these yet
//simple protected route
app.get('/profile', checkAuth, (req, res) => {
  res.send(`Welcome, ${req.session.user.username}`);
});


*/




// Start the server
app.listen(port, () => {
  console.log(`Server started successfully on port: ${port}`);
});







