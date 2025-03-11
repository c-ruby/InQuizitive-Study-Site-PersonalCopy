const express = require('express');
const db = require('./db');
const router = express.Router();

/*
    creating and displaying study sets 
*/
//route to get studysets for current user
router.get('/study-sets', (req, res) => {
  const username = req.session.user.username; // Get the username from the session
  if (!username) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = 'SELECT * FROM StudySets WHERE username = ?';
  db.query(query, [username], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.status(200).json(results);
  });
});


//route to add study set
router.post('/study-sets', (req, res) => {
    const username = req.session.user.username; // Get the username from the session
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const { set_name } = req.body;
    const query = 'INSERT INTO StudySets (username, set_name) VALUES (?, ?)';
    db.query(query, [username, set_name], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, set_name });
    });
  });

  
//add terms to a set 
router.post('/study-sets/:set_id/terms', (req, res) => {
    const { set_id } = req.params;
    const { term, definition } = req.body;
  
    const query = 'INSERT INTO Terms (set_id, term, definition) VALUES (?, ?, ?)';
    db.query(query, [set_id, term, definition], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, term, definition });
    });
  });

  
//get terms from a set 
router.get('/study-sets/:set_id/terms', (req, res) => {
    const { set_id } = req.params;
    const query = 'SELECT * FROM Terms WHERE set_id = ?';
  
    db.query(query, [set_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results); // Ensure the response is JSON formatted
    });
  });

  // Get study set details by ID
router.get('/study-sets/:studySetId', (req, res) => {
    const { studySetId } = req.params;
    const query = 'SELECT set_name FROM StudySets WHERE set_id = ?';
  
    db.query(query, [studySetId], (err, result) => {
        if (err) {
            console.error('Database query error:', err); // Log the error details
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Study set not found' });
        }
        res.status(200).json(result[0]);
    });
  });

  
  //delete terms 
router.delete('/terms/:term_id', (req, res) => {
    const { term_id } = req.params;
    const query = 'DELETE FROM Terms WHERE term_id = ?';
  
    db.query(query, [term_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Term deleted successfully' });
    });
  });
  //edit terms 
  // Update term
  router.put('/terms/:term_id', (req, res) => {
    const { term_id } = req.params;
    const { term, definition } = req.body;
    const query = 'UPDATE Terms SET term = ?, definition = ? WHERE term_id = ?';
  
    db.query(query, [term, definition, term_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Term updated successfully' });
    });
  });

  
  // Route to delete all terms associated with a study set and delete the study set
  router.delete('/study-sets/:set_id', (req, res) => {
    const { set_id } = req.params;
  
    // Start a transaction to ensure both deletions happen atomically
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
  
        // First, delete all terms associated with the study set
        const deleteTermsQuery = 'DELETE FROM Terms WHERE set_id = ?';
        db.query(deleteTermsQuery, [set_id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ error: err.message });
                });
            }
  
            // Then, delete the study set itself
            const deleteStudySetQuery = 'DELETE FROM StudySets WHERE set_id = ?';
            db.query(deleteStudySetQuery, [set_id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: err.message });
                    });
                }
  
                // Commit the transaction
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: err.message });
                        });
                    }
                    res.status(200).json({ message: 'Study set and associated terms deleted successfully' });
                });
            });
        });
    });
    
  });// Route to delete all terms associated with a study set and delete the study set


  router.delete('/study-sets/:set_id', (req, res) => {
      const { set_id } = req.params;
  
      // Start a transaction to ensure both deletions happen atomically
      db.beginTransaction(err => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
  
          // First, delete all terms associated with the study set
          const deleteTermsQuery = 'DELETE FROM Terms WHERE set_id = ?';
          db.query(deleteTermsQuery, [set_id], (err, result) => {
              if (err) {
                  return db.rollback(() => {
                      res.status(500).json({ error: err.message });
                  });
              }
  
              // Then, delete the study set itself
              const deleteStudySetQuery = 'DELETE FROM StudySets WHERE set_id = ?';
              db.query(deleteStudySetQuery, [set_id], (err, result) => {
                  if (err) {
                      return db.rollback(() => {
                          res.status(500).json({ error: err.message });
                      });
                  }
  
                  // Commit the transaction
                  db.commit(err => {
                      if (err) {
                          return db.rollback(() => {
                              res.status(500).json({ error: err.message });
                          });
                      }
                      res.status(200).json({ message: 'Study set and associated terms deleted successfully' });
                  });
              });
          });
      });
  });
  

  router.get('/recent-study-sets', (req, res) => {
    const username = req.session.user.username; // Get the username from the session
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const query = `
      SELECT s.set_id, s.set_name, v.visit_timestamp
      FROM VisitHistory v
      JOIN StudySets s ON v.set_id = s.set_id
      WHERE v.username = ?
      ORDER BY v.visit_timestamp DESC
      LIMIT 50
    `;
    
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching recent study sets:', err); // Log the error
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
  });
  

  //add a listing to the visit history for the current user 
router.post('/update-visit-history', (req, res) => {

    console.log("updating visit history...")
  
    const username = req.session.user.username; // Get the username from the session
    const { set_id } = req.body;
    
    if (!username || !set_id) {
        return res.status(400).json({ error: 'Bad Request' });
    }
  
    const query = `
      INSERT INTO VisitHistory (username, set_id, visit_timestamp)
      VALUES (?, ?, NOW())
    `;
    
    db.query(query, [username, set_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).send('Visit history updated');
    });
  });
  


module.exports = router; // Export the router so it can be mounted in the main app
  