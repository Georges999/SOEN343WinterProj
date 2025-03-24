//event schema
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    dateTime: {
      type: Date,
      required: [true, 'Please add a date and time']
    },
    location: {
      type: String,
      required: [true, 'Please add a location']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['workshop', 'lecture', 'seminar', 'conference', 'networking', 'other']
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity'],
      min: 1
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // Promotion fields
    isPromoted: {
      type: Boolean,
      default: false
    },
    activePromotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion'
    },
    registrationFee: {
      type: Number,
      default: 0
    },
    registrationFee: {
      type: Number,
      default: 0 // Free events have a fee of 0
    },
    isPromoted: { type: Boolean, default: false },
    promotionLevel: { 
      type: String, 
      enum: ['none', 'basic', 'premium', 'featured'],
      default: 'none'
    },
    promotionExpiry: { type: Date },
    promoter: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  {
    timestamps: true
  }
  
);

module.exports = mongoose.model('Event', eventSchema);