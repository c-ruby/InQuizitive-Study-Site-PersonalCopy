const bcrypt = require('bcrypt');

module.exports = function(app, db) 
{
  // Route to handle adding a new user account
  app.post('/add-user', async (req, res) => {
    const { username, password } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO user_credentials (username, password) VALUES (?, ?)';
      db.query(query, [username, hashedPassword], (err, results) => {
        if (err) {
          console.error('Error inserting user credentials:', err);
          res.status(500).json({ error: 'Database error' });
        } else {
          res.status(200).json({ message: 'User credentials added successfully', userId: results.insertId });
        }
      });
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

    // Route to check if user is authenticated
  app.get('/check-auth', (req, res) => {
    if (req.session.user) {
      res.json({ loggedIn: true, username: req.session.user.username });
    } else {
      res.json({ loggedIn: false });
    }
  });



  // Route to check for the presence of a user account in the database
  app.post('/check-username', async (req, res) => {
    const { username } = req.body;
    const query = 'SELECT * FROM user_credentials WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        if (results.length != 0) {
            return res.status(401).send('This username exists');
        }
        return res.status(200).send('Username does not exist');
    });
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

// Route to handle changing password
app.post('/change-password', async (req, res) => {
  const username = req.session.user.username;
  if (!username) {
      return res.status(401).json({ error: 'Unauthorized' });
  }
  const { password } = req.body;
 

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
}