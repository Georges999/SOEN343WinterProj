const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  promoter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending"
  },
  promotionLevel: {
    type: String,
    enum: ["basic", "featured", "premium"],
    default: "basic"
  }
}, { timestamps: true });

module.exports = mongoose.model("Promotion", PromotionSchema);