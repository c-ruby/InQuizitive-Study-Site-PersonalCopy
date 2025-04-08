module.exports = function(app, db) 
{
//transaction helper function 
const executeTransaction = (db, callback) => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return callback(err);
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return callback(err);
            }

            callback(null, connection, (commitErr) => {
                if (commitErr) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error('Transaction rolled back:', commitErr);
                    });
                }

                connection.commit((err) => {
                    connection.release();
                    if (err) {
                        console.error('Error committing transaction:', err);
                        return callback(err);
                    }
                    console.log('Transaction committed successfully');
                });
            });
        });
    });
};





//-----check answer route-----
const levenshtein = require('fast-levenshtein');

    app.post('/check-answer', (req, res) => {
        const { userInput, correctAnswer } = req.body; // Expect user input and correct answer in the request body

        // Compute Levenshtein distance
        const distance = levenshtein.get(userInput, correctAnswer);
        const threshold = Math.floor(correctAnswer.length/100 * 80); // tolerance set at ~80% character length

        if (distance <= threshold) {
            res.json({ success: true, message: "true" });
        } else {
            res.json({ success: false, message: "false" });
        }
    });


    // Route to get study sets for the current user
    app.get('/study-sets', (req, res) => {
      const username = req.session.user.username;
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
  
   // Route to add a study set
app.post('/study-sets', (req, res) => {
    const username = req.session.user.username;
    if (!username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { set_name, category } = req.body;
    
    // Validate the category input (optional, to ensure valid categories)
    const validCategories = [
        "Math", "Natural Science", "Tech Science", "History",
        "Social Sciences", "Language", "Test Prep", "Other"
    ];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    // Insert set_name and category into the database
    const query = 'INSERT INTO StudySets (username, set_name, category) VALUES (?, ?, ?)';
    db.query(query, [username, set_name, category], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, set_name, category });
    });
});

  
    // Route to add terms to a set
    app.post('/study-sets/:set_id/terms', (req, res) => {
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
  
    // Route to get terms from a set
    app.get('/study-sets/:set_id/terms', (req, res) => {
      const { set_id } = req.params;
      const query = 'SELECT * FROM Terms WHERE set_id = ?';
      db.query(query, [set_id], (err, results) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.status(200).json(results);
      });
    });
  
    //get study set infor from set ID 
    app.get('/study-set-info/:studySetId', (req, res) => {
        const { studySetId } = req.params;
        const query = 'SELECT * FROM StudySets WHERE set_id = ?';
        db.query(query, [studySetId], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log(result[0]);
            console.log('Query:', query);
            console.log('Study Set ID:', studySetId);
            if (result.length === 0) {
                return res.status(404).json({ message: 'Study set not found' });
            }
            res.status(200).json(result[0]);
        });
      });

    // Route to get study set name by ID
    app.get('/study-sets/:studySetId', (req, res) => {
      const { studySetId } = req.params;
      const query = 'SELECT set_name FROM StudySets WHERE set_id = ?';
      db.query(query, [studySetId], (err, result) => {
          if (err) {
              console.error('Database query error:', err);
              return res.status(500).json({ error: err.message });
          }
          
          console.log(result[0]);
          if (result.length === 0) {
              return res.status(404).json({ message: 'Study set not found' });
          }
          res.status(200).json(result[0]);
      });
    });
  
    // Route to delete a term
    app.delete('/terms/:term_id', (req, res) => {
      const { term_id } = req.params;
      const query = 'DELETE FROM Terms WHERE term_id = ?';
      db.query(query, [term_id], (err, result) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: 'Term deleted successfully' });
      });
    });
  
    // Route to update a term
    app.put('/terms/:term_id', (req, res) => {
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
  
    // Route to delete a study set and associated terms
    app.delete('/study-sets/:set_id', (req, res) => {
        const { set_id } = req.params;
    
        executeTransaction(db, (err, connection, finalizeTransaction) => {
            if (err) {
                return res.status(500).json({ error: 'Database connection error' });
            }
    
            const deleteTermsQuery = 'DELETE FROM Terms WHERE set_id = ?';
            connection.query(deleteTermsQuery, [set_id], (err, result) => {
                if (err) {
                    return finalizeTransaction(err);
                }
    
                const deleteStudySetQuery = 'DELETE FROM StudySets WHERE set_id = ?';
                connection.query(deleteStudySetQuery, [set_id], (err, result) => {
                    if (err) {
                        return finalizeTransaction(err);
                    }
    
                    // If all queries succeed, finalize the transaction
                    finalizeTransaction(null);
                    res.status(200).json({ message: 'Study set and associated terms deleted successfully' });
                });
            });
        });
    });
    
  
    // Route to get recent study sets for the current user
    app.get('/recent-study-sets', (req, res) => {
      const username = req.session.user.username;
      if (!username) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const query = `
        SELECT s.set_id, s.set_name, MAX(v.visit_timestamp) AS latest_visit
        FROM VisitHistory v
        JOIN StudySets s ON v.set_id = s.set_id
        WHERE v.username = ?
        GROUP BY s.set_id, s.set_name
        ORDER BY latest_visit DESC
        LIMIT 50
      `;

      
      db.query(query, [username], (err, results) => {
          if (err) {
              console.error('Error fetching recent study sets:', err);
              return res.status(500).json({ error: err.message });
          }
          res.status(200).json(results);
      });
    });
  
    // Route to add a visit to the visit history
    app.post('/update-visit-history', (req, res) => {
      const username = req.session.user.username;
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



//-----learning status routes---------
    //get status for specific term and user 
    app.get('/get-term-status', (req, res) => {
        const { username, termId } = req.query;
        const query = `
            SELECT status
            FROM TermStatus
            WHERE username = ? AND term_id = ?;
        `;
        db.query(query, [username, termId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send({ message: 'Error retrieving term status' });
            } else if (results.length > 0) {
                res.send({ status: results[0].status });
            } else {
                res.send({ status: 0 }); // Default to 'unknown'
            }
        });
    });

    app.post('/update-term-status', (req, res) => {
        const { termId, username, status } = req.body;
    
        const query = `
            INSERT INTO TermStatus (username, term_id, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status);
        `;
    
        db.query(query, [username, termId, status], (err) => {
            if (err) {
                console.error('Error updating term status:', err);
                res.status(500).send({ message: 'Failed to update term status' });
            } else {
                res.send({ message: 'Term status updated successfully' });
            }
        });
    });
    
    
//----copy study set------
app.post('/copy-study-set', (req, res) => {
    const username = req.session.user?.username;
    const { set_id } = req.body;

    if (!username || !set_id) {
        return res.status(400).json({ error: 'Bad Request' });
    }

    // Fetch the original study set details
    const getOriginalSetQuery = 'SELECT set_name, category FROM StudySets WHERE set_id = ?';
    db.query(getOriginalSetQuery, [set_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Study set not found' });
        }

        const originalSet = results[0];
        const newSetName = `${originalSet.set_name} (${username}'s copy)`;

        // Insert a new study set for the current user
        const createNewSetQuery = 'INSERT INTO StudySets (username, set_name, category) VALUES (?, ?, ?)';
        db.query(createNewSetQuery, [username, newSetName, originalSet.category], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const newSetId = result.insertId;

            // Fetch terms from the original set
            const getTermsQuery = 'SELECT term, definition FROM Terms WHERE set_id = ?';
            db.query(getTermsQuery, [set_id], (err, terms) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (terms.length === 0) {
                    return res.status(200).json({
                        message: 'Study set copied successfully!',
                        newSetId
                    });
                }

                // Insert terms into the new study set
                const insertTermsQuery = 'INSERT INTO Terms (set_id, term, definition) VALUES ?';
                const termsValues = terms.map(term => [newSetId, term.term, term.definition]);

                db.query(insertTermsQuery, [termsValues], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(200).json({
                        message: 'Study set copied successfully!',
                        newSetId
                    });
                });
            });
        });
    });
});

    
};
  