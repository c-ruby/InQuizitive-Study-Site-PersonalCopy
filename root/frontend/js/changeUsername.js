const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { connectToDatabase } = require('../dbConfig');

router.post('/change-username', async (req, res) => {
    const { username } = req.body;
     if (!username) {
        return res.status(400).json({ message: 'Please enter a username' });
     }

     try {
        await connectToDatabase();
        const request = new sql.Request();
        const query = `UPDATE Users SET username = '${username}' WHERE id = ${req.user.id}`;
        request.input('username', sql.VarChar, username);
        request.input('userId', sql.Int, req.session.userId);
        await request.query(query);

        res.json({ success: true});
     }
     catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'An error occurred while updating your username. Please try again.' });
     }
    });
    module.exports = router;