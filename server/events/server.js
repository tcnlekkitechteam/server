const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// In-memory storage for simplicity
const events = [];

app.post('/api/events', (req, res) => {
  const eventData = req.body;

  if (!eventData || !eventData.name || !eventData.date) {
    return res.status(400).json({ error: 'Invalid event data' });
  }

  events.push(eventData);
  res.status(201).json({ message: 'Event created successfully', event: eventData });
});