module.exports = function(app, db) {
    // Basic title search route using POST method
    app.post('/study-sets/search', (req, res) => {
        let { set_name, categories } = req.body;
    
        // Ensure `categories` is an array or fallback to a default array
        if (!Array.isArray(categories)) {
            categories = []; // Default to empty array
        }
    
        const wildcardQuery = `%${set_name}%`;
    
        let sql = `
            SELECT * 
            FROM StudySets
            WHERE set_name LIKE ?
        `;
    
        const params = [wildcardQuery];
    
        // Add the category filter only if categories are selected
        if (categories.length > 0) {
            sql += ` AND category IN (${categories.map(() => '?').join(', ')})`;
            params.push(...categories); // Bind category values dynamically
        }
    
        sql += ' ORDER BY set_name';
    
        // Execute the query
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json(results.length ? results : []);
        });
    });

    // New route to search for public study sets from other users
    app.post('/study-sets/explore', (req, res) => {
        const { set_name } = req.body;

        const wildcardQuery = `%${set_name}%`;

        let sql = `
            SELECT StudySets.id, StudySets.set_name, StudySets.description, Users.username
            FROM StudySets
            JOIN Users ON StudySets.user_id = Users.id
            WHERE StudySets.set_name LIKE ? AND StudySets.is_public = 1
        `;

        const params = [wildcardQuery];

        // Execute the query
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json(results.length ? results : []);
        });
    });

    // New route to copy a study set to the user's study sets
    app.post('/study-sets/add', (req, res) => {
        // Retrieve user_id from session (or token if using JWT)
        const user_id = req.session.user_id; // Ensure session middleware is configured
        const { study_set_id } = req.body;
    
        if (!user_id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
    
        // Query to copy the study set
        const sql = `
            INSERT INTO StudySets (user_id, set_name, description, category, is_public)
            SELECT ?, set_name, description, category, 0
            FROM StudySets
            WHERE id = ?
        `;
    
        const params = [user_id, study_set_id];
    
        // Execute the query
        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).json({ error: 'Failed to add study set' });
            }
            res.status(200).json({ message: 'Study set added successfully' });
        });
    });
};