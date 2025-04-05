// User schema
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["client", "admin", "promoter"], 
    default: "client" 
  },
  // Client-specific fields
  eventsRegistered: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event" 
  }],
  // Admin-specific fields
  eventsCreated: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event" 
  }],
  // Promoter-specific fields
  eventsPromoted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion"
  }],
  skills: [{ type: String }],
  achievements: [{ type: String }],
  expertise: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);