const auth = require('./auth');
const express = require('express');
const router = express.Router();
const Event = require('../Models/Event');

const { protect } = require('./Middleware/authMiddleware.js');

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/promoted', protect, async (req, res) => {
  try {
    // Ensure user is a promoter
    if (req.user.role !== 'promoter') {
      return res.status(403).json({ message: 'Only promoters can access promoted events' });
    }
    
    // Find events promoted by this user
    const events = await Event.find({ 
      promoter: req.user.id,
      isPromoted: true
    }).sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching promoted events:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new event
router.post('/', protect, async (req, res) => {
  try {
    // Format date and time 
    let eventData = req.body;
    
    // Create event with the organizer being the current user
    const event = new Event({
      ...eventData,
      organizer: req.user.id // This comes from the auth middleware
    });
    
    // Save to database
    const savedEvent = await event.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({ message: error.message });
  }
});

// Register for an event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if already registered
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Check if event is full
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }
    
    // Add user to attendees
    event.attendees.push(req.user.id);
    await event.save();
    
    res.status(200).json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Updated cancel registration route with better ID handling

// Cancel registration
router.delete('/:id/register', protect, async (req, res) => {
  try {
    console.log(`Attempting to cancel registration for event ${req.params.id} by user ${req.user.id}`);
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Debug logging
    console.log('Current attendees:', event.attendees);
    console.log('User ID to remove:', req.user.id);
    
    // Convert all attendee IDs to strings for more reliable comparison
    const attendeeStrings = event.attendees.map(id => id.toString());
    const userIdString = req.user.id.toString();
    
    console.log('Attendee IDs as strings:', attendeeStrings);
    console.log('User ID as string:', userIdString);
    console.log('Includes check result:', attendeeStrings.includes(userIdString));
    
    // Check if user is registered using string comparison
    if (!attendeeStrings.includes(userIdString)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }
    
    // Use MongoDB's pull operator for most reliable removal
    const result = await Event.updateOne(
      { _id: req.params.id },
      { $pull: { attendees: req.user._id } }
    );
    
    console.log('Update result:', result);
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to cancel registration' });
    }
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the PUT route with better ID comparison
router.put('/:id', protect, async (req, res) => {
  console.log(`Received PUT request for event ID: ${req.params.id}`);
  console.log('User ID from token:', req.user.id);
  
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('Event found:', event);
    console.log('Organizer ID (raw):', event.organizer);
    console.log('Organizer ID (string):', event.organizer.toString());
    console.log('User ID:', req.user.id);
    
    // Skip the authorization check for admin users
    if (req.user.role === 'admin') {
      console.log('Admin user - bypassing organizer check');
      
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      console.log('Event updated successfully by admin');
      return res.json(updatedEvent);
    }
    
    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user.id) {
      console.log('Authorization failed: User is not the organizer');
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('Event updated successfully');
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Remove an attendee (admin only)
router.delete('/:id/attendees/:attendeeId', protect, async (req, res) => {
  try {
    // Only allow admins to remove attendees
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove attendees' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if attendee exists in the event
    if (!event.attendees.includes(req.params.attendeeId)) {
      return res.status(400).json({ message: 'Attendee not registered for this event' });
    }
    
    // Remove attendee from the event
    const result = await Event.updateOne(
      { _id: req.params.id },
      { $pull: { attendees: req.params.attendeeId } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Failed to remove attendee' });
    }
    
    res.json({ message: 'Attendee removed successfully' });
  } catch (error) {
    console.error('Error removing attendee:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/recommendations', auth, async (req, res) => {
  try {
    const { skills = [], achievements = [], expertise = [] } = req.body;
    
    // Get all events
    let events = await Event.find({
      dateTime: { $gt: new Date() } // Only show future events
    }).populate('organizer', 'name');
    
    if (!events.length) {
      return res.json([]);
    }
    
    // Create search terms from user profile
    const searchTerms = [
      ...skills, 
      ...achievements, 
      ...expertise
    ].map(term => term.toLowerCase());
    
    // Function to calculate match score for each event
    const calculateMatchScore = (event) => {
      let score = 0;
      let matchReasons = [];
      
      // Check title
      searchTerms.forEach(term => {
        if (event.title.toLowerCase().includes(term)) {
          score += 3;
          matchReasons.push(`Event title matches your profile: "${term}"`);
        }
      });
      
      // Check description
      searchTerms.forEach(term => {
        if (event.description.toLowerCase().includes(term)) {
          score += 2;
          if (!matchReasons.some(reason => reason.includes(term))) {
            matchReasons.push(`Event description matches your profile: "${term}"`);
          }
        }
      });
      
      // Check category
      if (event.category) {
        if (expertise.some(exp => event.category.toLowerCase().includes(exp.toLowerCase()))) {
          score += 5;
          matchReasons.push(`Event category matches your area of expertise`);
        }
        
        if (skills.some(skill => event.category.toLowerCase().includes(skill.toLowerCase()))) {
          score += 4;
          matchReasons.push(`Event category matches your skills`);
        }
      }
      
      // Return the event with score and match reasons
      return {
        ...event.toObject(),
        matchScore: score,
        matchReasons: score > 0 ? matchReasons : ['General recommendation based on available events']
      };
    };
    
    // Calculate scores for each event
    const scoredEvents = events.map(calculateMatchScore);
    
    // Filter events with at least some match and sort by score
    const recommendedEvents = scoredEvents
      .filter(event => event.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6); // Limit to top 6 recommendations
      
    res.json(recommendedEvents);
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;