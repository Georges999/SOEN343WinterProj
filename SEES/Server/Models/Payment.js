const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ["event_registration", "event_promotion"],
    required: true
  },
  // Reference to either the event registration or promotion
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Could reference an Event or Promotion
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Event', 'Promotion']
  },
  // Payment details (simulated)
  cardLast4: String,
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal"],
    default: "credit_card"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);