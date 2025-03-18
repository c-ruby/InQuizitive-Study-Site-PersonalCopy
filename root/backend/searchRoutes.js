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
    
    
    
};
