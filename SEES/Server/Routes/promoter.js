const express = require('express');
const router = express.Router();
const Promotion = require('../Models/Promotion');
const Event = require('../Models/Event');
const { protect, restrictTo } = require('./Middleware/authMiddleware.js');

// Get all promotions by this promoter
router.get('/promotions', protect, async (req, res) => {
  try {
    const promotions = await Promotion.find({ promoter: req.user.id })
      .populate('event');
    
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available events to promote
router.get('/available-events', protect, async (req, res) => {
  try {
    // Find events that aren't already promoted
    const events = await Event.find({ isPromoted: false })
      .populate('organizer', 'name email');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promoter dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const promotions = await Promotion.find({ promoter: req.user.id });
    const activePromotions = promotions.filter(promo => promo.status === 'active').length;
    
    res.json({
      totalPromotions: promotions.length,
      activePromotions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;