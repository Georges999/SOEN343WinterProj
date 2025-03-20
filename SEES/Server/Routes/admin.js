const express = require('express');
const router = express.Router();
const Event = require('../Models/Event');
const { protect, restrictTo } = require('./Middleware/authMiddleware.js');

// Get all events created by this admin
router.get('/events', protect, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    const totalAttendees = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
    const promotedEvents = events.filter(event => event.isPromoted).length;
    
    res.json({
      totalEvents: events.length,
      totalAttendees,
      promotedEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;