module.exports = function(app, db) {
    // Basic title search route using POST method
    app.post('/study-sets/search', (req, res) => {
        const { set_name } = req.body;
        console.log('Search query:', set_name);  // Print the search query

        const sql = `
            SELECT * FROM StudySets
            WHERE set_name LIKE ?
            ORDER BY set_name;
        `;

        const wildcardQuery = `%${set_name}%`;
        //console.log('Full query:', sql, 'with parameter:', wildcardQuery);  // Print the full query and parameter

        db.query(sql, [wildcardQuery], (err, results) => {
            if (err) {
                console.error('Database query error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            //console.log('Query results:', results);  // Print the query results
            if (results.length === 0) {
                return res.status(200).json([]); // Return an empty array if no results found
            }
            res.status(200).json(results);
        });
    });
};
