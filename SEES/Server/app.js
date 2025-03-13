//express app setup
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./Config/db.js");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors()); // Allows frontend access

// Routes
app.use("/api/auth", require("./Routes/auth.js"));
app.use("/api/events", require("./Routes/events.js"));

module.exports = app;
