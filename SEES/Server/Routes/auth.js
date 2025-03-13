// Authentication routes (login, register)

const express = require("express");
const { registerUser, loginUser } = require("../Controllers/authController.js");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

const protect = require('./Middleware/authMiddleware');
router.get('/protected-route', protect, (req, res) => {
    // Your protected route logic
    res.json({
        message: 'You have access to this protected route',
        userData: req.user // This comes from the middleware
    });
});

// Basic test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

module.exports = router;  // Export the router, not an object