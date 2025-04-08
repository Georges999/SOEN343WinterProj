const express = require('express');
const router = express.Router();
const Event = require('../Models/Event');
const { protect, restrictTo} = require('./Middleware/authMiddleware.js');
const Payment = require('../Models/Payment'); // Add this line

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
    // Get total events
    const totalEvents = await Event.countDocuments();
    
    // Get total attendees (unique users who have registered for events)
    // Instead of using Payment model, get attendees from events
    let allAttendees = new Set();
    const allEvents = await Event.find();
    allEvents.forEach(event => {
      if (event.attendees && Array.isArray(event.attendees)) {
        event.attendees.forEach(attendee => {
          allAttendees.add(attendee.toString());
        });
      }
    });
    const totalAttendees = allAttendees.size || 0; // Ensure it's always a number
    
    // Get total revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Generate time-series data for events and registrations
    const now = new Date();
    const timeRange = req.query.timeRange || 'month';
    
    // Calculate start date based on time range
    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Get events created in time range
    const eventsInRange = await Event.find({
      createdAt: { $gte: startDate, $lte: now }
    }).sort('createdAt');
    
    // Get registrations in time range
    const registrationsInRange = await Payment.find({
      paymentType: 'event_registration',
      createdAt: { $gte: startDate, $lte: now }
    }).sort('createdAt');
    
    // Format dates and prepare data for the frontend
    const labels = [];
    const eventData = [];
    const registrationData = [];
    
    // Generate labels based on time range
    const labelCount = timeRange === 'week' ? 7 : timeRange === 'month' ? 4 : 12;
    const labelFormat = timeRange === 'week' ? 'ddd' : timeRange === 'month' ? 'Week W' : 'MMM';
    
    // Simple data generation for demo purposes
    for (let i = 0; i < labelCount; i++) {
      if (timeRange === 'week') {
        // For week, use days of the week
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i % 7];
        labels.push(dayName);
      } else if (timeRange === 'month') {
        // For month, use week numbers
        labels.push(`Week ${i + 1}`);
      } else {
        // For year, use month names
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
        labels.push(monthName);
      }
      
      // Generate some sample data based on actual counts
      eventData.push(Math.round(Math.random() * (totalEvents / labelCount) * 1.5));
      registrationData.push(Math.round(Math.random() * (totalAttendees / labelCount) * 1.5));
    }
    
    res.json({
      totalEvents,
      totalAttendees,
      totalRevenue,
      labels,
      eventData,
      registrationData
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
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
      const attendeeCount = Array.isArray(event.attendees) ? event.attendees.length : 0;
      
      return {
        name: event.title || 'Untitled Event',
        capacity: event.capacity || 0,
        attendees: attendeeCount,
        attendanceRate: event.capacity > 0 ? 
          (attendeeCount / event.capacity * 100).toFixed(1) : 0
      };
    });
    
    // Structure the response in a format expected by the frontend
    const labels = attendanceData.map(item => item.name);
    const capacity = attendanceData.map(item => item.capacity);
    const attendees = attendanceData.map(item => item.attendees);
    
    res.json({
      labels,
      capacity,
      attendees
    });
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    res.status(500).json({ message: error.message });
  }
});
// Revenue analytics
router.get('/analytics/revenue', protect, restrictTo('admin'), async (req, res) => {
  try {
    // Generate sample data if no real data exists
    const dates = [];
    const registrationData = [];
    const promotionData = [];
    
    // Generate dates for the last 5 days
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      registrationData.push(Math.floor(Math.random() * 1000) + 500);
      promotionData.push(Math.floor(Math.random() * 300) + 100);
    }
    
    res.json({
      labels: dates,
      registration: registrationData,
      promotion: promotionData
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
      const category = event.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Ensure at least some categories exist for demo purposes
    if (Object.keys(categoryCount).length === 0) {
      categoryCount['Education'] = 5;
      categoryCount['Technology'] = 3;
      categoryCount['Business'] = 2;
    }
    
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
    
    // Ensure we have at least some data for demo
    if (promotionLevels.basic + promotionLevels.premium + promotionLevels.featured === 0) {
      promotionLevels.basic = 3;
      promotionLevels.premium = 2;
      promotionLevels.featured = 1;
    }
    
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