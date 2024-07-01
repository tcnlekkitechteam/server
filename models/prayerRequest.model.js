const mongoose = require("mongoose");

// Define schema for PrayerRequest
const prayerRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  request: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model based on schema
const PrayerRequest = mongoose.model("PrayerRequest", prayerRequestSchema);

module.exports = PrayerRequest;
