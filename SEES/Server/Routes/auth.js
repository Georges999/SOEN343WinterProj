const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Event = require('../Models/Event');
const { protect } = require('./Middleware/authMiddleware.js');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'client' // Default to client if not specified
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//get skills info
router.put('/profile', protect, async (req, res) => {
  try {
      const user = await User.findByIdAndUpdate(req.user.id, {
          skills: req.body.skills,
          achievements: req.body.achievements,
          expertise: req.body.expertise
      }, { new: true });
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

router.post('/recommendations', protect, async (req, res) => {
  try {
      const { skills, achievements, expertise } = req.body;
      const allEvents = await Event.find();
      
      console.log("Recommendation request:", { skills, achievements, expertise });
      console.log("Found events:", allEvents.length);
      
      // Handle case with no events
      if (!allEvents || allEvents.length === 0) {
          return res.json([]);
      }

      const tfidf = new TfIdf();

      // Build TF-IDF corpus from event descriptions
      allEvents.forEach(event => {
          if (event.description) {
              tfidf.addDocument(event.description);
          }
      });

      // Get user interests
      const userQuery = [...(skills || []), ...(achievements || []), ...(expertise || [])].join(' ');

      const recommendations = [];
      allEvents.forEach((event, index) => {
          let score = 0;
          // Make sure there's content to analyze
          if (userQuery && event.description) {
              try {
                  tfidf.listTerms(0 /* document index */).forEach(function (item) {
                      if (userQuery.includes(item.term)) {
                          score += item.tfidf;
                      }
                  });
              } catch (err) {
                  console.error("Error processing TF-IDF for event:", err);
                  // Default score if there's an error
                  score = 0.1;
              }
          }
          recommendations.push({ event, score });
      });

      recommendations.sort((a, b) => b.score - a.score);
      res.json(recommendations.slice(0, 5)); // Top 5 recommendations
  } catch (error) {
      console.error('Error fetching event recommendations:', error);
      // Return empty array instead of error for more graceful handling
      res.json([]);
  }
});

router.put('/:id/profile', protect, async (req, res) => {
  try {
    const { skills, achievements, expertise } = req.body;
    
    // Make sure the user is updating their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the profile fields
    if (skills) user.skills = skills;
    if (achievements) user.achievements = achievements;
    if (expertise) user.expertise = expertise;
    
    await user.save();
    
    // Return the updated user without password
    const userToReturn = user.toObject();
    delete userToReturn.password;
    
    res.json(userToReturn);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;