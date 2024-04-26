const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  registrationLink: {
    type: String,
    required: false
  },
  volunteerLink: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Event', eventSchema);