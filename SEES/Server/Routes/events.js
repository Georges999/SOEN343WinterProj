const express = require('express');
const router = express.Router();

const protect = require('./Middleware/authMiddleware.js');

// GET all events
router.get('/', async (req, res) => {
  try {
    // Temporary response until you implement database fetching
    res.json([
      {
        _id: '1',
        title: 'Sample Workshop',
        description: 'This is a sample workshop for testing',
        dateTime: new Date().toISOString(),
        location: 'Virtual',
        category: 'workshop',
        organizer: 'system',
        attendees: [],
        capacity: 50
      }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
    try {
      // For now, return dummy data (later you'll fetch from MongoDB)
      res.json({
        _id: req.params.id,
        title: 'Sample Event',
        description: 'This is a detailed description of the event.',
        dateTime: new Date().toISOString(),
        location: 'Concordia University',
        category: 'workshop',
        capacity: 50,
        organizer: {
          _id: 'org123',
          name: 'Event Organizer'
        },
        attendees: [
          { _id: 'user1', name: 'John Doe' },
          { _id: 'user2', name: 'Jane Smith' }
        ]
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // CREATE a new event
router.post('/', protect, async (req, res) => {
    try {
      // Log the received data for debugging
      console.log("Creating event:", req.body);
      
      // In a real app, you would save this to the database
      // For now, just send back a success response with the data
      const newEvent = {
        _id: Math.random().toString(36).substring(2, 15),
        ...req.body,
        organizer: req.user.id,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: error.message });
    }
  });

module.exports = router;