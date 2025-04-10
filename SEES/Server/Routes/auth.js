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
    const { skills = [], achievements = [], expertise = [] } = req.body;
    
    // Get all future events
    let events = await Event.find({
      dateTime: { $gt: new Date() } // Only future events
    }).populate('organizer', 'name');
    
    if (!events.length) {
      return res.json([]);
    }
    
    console.log(`Processing ${events.length} events for recommendations`);
    
    // Flatten the user profile terms
    const userTerms = [
      ...skills.map(s => s.toLowerCase()), 
      ...achievements.map(s => s.toLowerCase()), 
      ...expertise.map(s => s.toLowerCase())
    ];
    
    console.log("User terms:", userTerms);
    
    // Score each event
    const scoredEvents = events.map(event => {
      let score = 0;
      let matchReasons = [];
      
      // Check title
      userTerms.forEach(term => {
        if (event.title && event.title.toLowerCase().includes(term)) {
          score += 3;
          matchReasons.push(`Title matches "${term}"`);
        }
      });
      
      // Check description
      userTerms.forEach(term => {
        if (event.description && event.description.toLowerCase().includes(term)) {
          score += 2;
          matchReasons.push(`Description matches "${term}"`);
        }
      });
      
      // Check category
      if (event.category) {
        const category = event.category.toLowerCase();
        
        expertise.forEach(exp => {
          if (category.includes(exp.toLowerCase())) {
            score += 5;
            matchReasons.push(`Category matches expertise "${exp}"`);
          }
        });
        
        skills.forEach(skill => {
          if (category.includes(skill.toLowerCase())) {
            score += 4; 
            matchReasons.push(`Category matches skill "${skill}"`);
          }
        });
      }
      
      // Normalize score to be between 0 and 1
      // Maximum possible score would be around 14 (3+2+5+4) per term
      const normalizedScore = userTerms.length > 0 ? score / (14 * userTerms.length) : 0;
      
      console.log(`Event "${event.title}" score: ${score}, normalized: ${normalizedScore.toFixed(2)}`);
      
      return {
        ...event._doc,
        score: normalizedScore,
        rawScore: score,
        matchReasons
      };
    });
    
    // Sort by score
    scoredEvents.sort((a, b) => b.score - a.score);
    
    // Filter for meaningful matches
    const matchThreshold = 0.05; // 5% match minimum
    const goodMatches = scoredEvents.filter(event => event.score >= matchThreshold);
    
    // Return only one best match if we have a good one
    if (goodMatches.length > 0) {
      const bestMatch = goodMatches[0];
      console.log(`Returning best match: "${bestMatch.title}" with score ${bestMatch.score}`);
      return res.json([bestMatch]);
    } else if (scoredEvents.length > 0) {
      // No good matches, but return the best one anyway if available
      const bestMatch = scoredEvents[0];
      console.log(`No good matches but returning top result: "${bestMatch.title}" with score ${bestMatch.score}`);
      return res.json([bestMatch]);
    }
    
    // No matches at all
    console.log('No matches found');
    return res.json([]);
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
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