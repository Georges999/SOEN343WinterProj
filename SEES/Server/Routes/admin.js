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


// Analytics summary
router.get('/analytics/summary', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    
    // Calculate total attendees
    const totalAttendees = events.reduce((sum, event) => {
      return sum + (event.attendees?.length || 0);
    }, 0);
    
    // Calculate total revenue
    const payments = await Payment.find({
      relatedEntity: { $in: events.map(event => event._id) }
    });
    
    const totalRevenue = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);
    
    // Event data by time periods
    const now = new Date();
    const pastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentEvents = await Event.find({ 
      organizer: req.user.id,
      createdAt: { $gte: pastMonth }
    }).sort('createdAt');
    
    // Format data for charts
    const eventsByDay = {};
    const registrationsByDay = {};
    
    recentEvents.forEach(event => {
      const dateStr = event.createdAt.toISOString().split('T')[0];
      eventsByDay[dateStr] = (eventsByDay[dateStr] || 0) + 1;
      
      event.attendees.forEach(attendee => {
        registrationsByDay[dateStr] = (registrationsByDay[dateStr] || 0) + 1;
      });
    });
    
    res.json({
      totalEvents: events.length,
      totalAttendees,
      totalRevenue,
      eventsByDay,
      registrationsByDay
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Attendance analytics
router.get('/analytics/attendance', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find({ 
      organizer: req.user.id 
    }).sort('-dateTime').limit(10);
    
    const attendanceData = events.map(event => {
      return {
        name: event.title,
        capacity: event.capacity,
        attendees: event.attendees.length,
        attendanceRate: event.capacity > 0 ? 
          (event.attendees.length / event.capacity * 100).toFixed(1) : 0
      };
    });
    
    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Revenue analytics
router.get('/analytics/revenue', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(event => event._id);
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const payments = await Payment.find({
      relatedEntity: { $in: eventIds },
      createdAt: { $gte: startDate }
    }).sort('createdAt');
    
    // Group payments by day and type
    const revenueByDay = {};
    
    payments.forEach(payment => {
      const dateStr = payment.createdAt.toISOString().split('T')[0];
      
      if (!revenueByDay[dateStr]) {
        revenueByDay[dateStr] = {
          registration: 0,
          promotion: 0
        };
      }
      
      if (payment.paymentType === 'event_registration') {
        revenueByDay[dateStr].registration += payment.amount;
      } else if (payment.paymentType === 'event_promotion') {
        revenueByDay[dateStr].promotion += payment.amount;
      }
    });
    
    res.json({
      revenueByDay
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Promotion analytics
router.get('/analytics/promotions', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    
    // Count events by category
    const categoryCount = {};
    events.forEach(event => {
      const category = event.category || 'other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Count promoted events by level
    const promotionLevels = {
      basic: 0,
      premium: 0,
      featured: 0
    };
    
    events.filter(event => event.isPromoted).forEach(event => {
      const level = event.promotionLevel || 'basic';
      promotionLevels[level] = (promotionLevels[level] || 0) + 1;
    });
    
    res.json({
      categoryCount,
      promotionLevels
    });
  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;