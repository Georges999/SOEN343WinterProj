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

// In payments.js - edit the event-promotion payment handler

// Process event promotion payment
router.post('/event-promotion/:eventId', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { paymentMethod, cardDetails, promotionLevel = 'basic', amount = 25 } = req.body;
    
    // Find the event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is a promoter
    if (req.user.role !== 'promoter') {
      return res.status(403).json({ message: 'Only promoters can promote events' });
    }
    
    // Set duration based on promotion level
    let duration = 7; // default for basic
    if (promotionLevel === 'premium') duration = 14;
    if (promotionLevel === 'featured') duration = 30;
    
    const promotionEndDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    
    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      amount: amount,
      paymentType: 'event_promotion',
      relatedEntity: event._id,
      entityType: 'Event',
      cardLast4: cardDetails?.cardNumber?.slice(-4) || '0000',
      paymentMethod,
      status: 'completed'
    });
    
    await payment.save();
    
    // Create promotion record
    const promotion = new Promotion({
      event: event._id,
      promoter: req.user.id,
      startDate: new Date(),
      endDate: promotionEndDate,
      promotionLevel,
      status: 'active',
      cost: amount
    });
    
    await promotion.save();
    
    // Update event with promotion details
    event.isPromoted = true;
    event.promotionLevel = promotionLevel;
    event.promotionExpiry = promotionEndDate;
    event.promoter = req.user.id;
    
    // Keep the promotions array for reference
    event.promotions = event.promotions || [];
    event.promotions.push(promotion._id);
    await event.save();
    
    res.status(201).json({
      message: 'Payment successful, event promoted',
      payment,
      promotion
    });
  } catch (error) {
    console.error('Promotion payment error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;