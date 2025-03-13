// Event management routes

const express = require('express');
const router = express.Router();

// Basic test route
router.get('/test', (req, res) => {
    res.json({ message: 'Events route is working' });
});

module.exports = router;  // Export the router, not an object