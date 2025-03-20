const express = require('express');
const router = express.Router();
const Payment = require('../Models/Payment');
const Event = require('../Models/Event');
const Promotion = require('../Models/Promotion');
const { protect } = require('./Middleware/authMiddleware.js');

// Process event registration payment
router.post('/event-registration/:eventId', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { paymentMethod, cardDetails } = req.body;
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      amount: event.registrationFee || 0,
      paymentType: 'event_registration',
      relatedEntity: event._id,
      entityType: 'Event',
      cardLast4: cardDetails?.cardNumber?.slice(-4) || '0000',
      paymentMethod,
      status: 'completed' // In a real app, this would be set after processing
    });
    
    await payment.save();
    
    // Add user to event attendees
    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }
    
    res.status(201).json({ 
      message: 'Payment successful, registration complete',
      payment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process event promotion payment
router.post('/event-promotion/:eventId', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { paymentMethod, cardDetails, promotionLevel, endDate } = req.body;
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Calculate amount based on promotion level
    let amount = 0;
    switch(promotionLevel) {
      case 'basic': amount = 10; break;
      case 'featured': amount = 25; break;
      case 'premium': amount = 50; break;
      default: amount = 10;
    }
    
    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      amount,
      paymentType: 'event_promotion',
      relatedEntity: event._id,
      entityType: 'Event',
      cardLast4: cardDetails?.cardNumber?.slice(-4) || '0000',
      paymentMethod,
      status: 'completed' // In a real app, this would be set after processing
    });
    
    await payment.save();
    
    // Create promotion record
    const promotion = new Promotion({
      event: event._id,
      promoter: req.user.id,
      startDate: new Date(),
      endDate: new Date(endDate),
      payment: payment._id,
      status: 'active',
      promotionLevel
    });
    
    await promotion.save();
    
    // Update event
    event.isPromoted = true;
    event.activePromotion = promotion._id;
    await event.save();
    
    res.status(201).json({ 
      message: 'Payment successful, promotion active',
      payment,
      promotion
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;