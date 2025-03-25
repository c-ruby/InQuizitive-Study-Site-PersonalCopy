module.exports = function(app, db) 
{
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
  
      // Start a transaction to ensure both deletions happen atomically
      db.beginTransaction(err => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
  
          const deleteTermsQuery = 'DELETE FROM Terms WHERE set_id = ?';
          db.query(deleteTermsQuery, [set_id], (err, result) => {
              if (err) {
                  return db.rollback(() => {
                      res.status(500).json({ error: err.message });
                  });
              }
  
              const deleteStudySetQuery = 'DELETE FROM StudySets WHERE set_id = ?';
              db.query(deleteStudySetQuery, [set_id], (err, result) => {
                  if (err) {
                      return db.rollback(() => {
                          res.status(500).json({ error: err.message });
                      });
                  }
  
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
  
    // Route to get recent study sets for the current user
    app.get('/recent-study-sets', (req, res) => {
      const username = req.session.user.username;
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
};
  