const Event = require('../routes/event');

exports.createEvent = async (req, res) => {
  try {
    const { eventName, date, time, registrationLink, image } = req.body;
    const event = new Event({ eventName, date, time, registrationLink, image });
    await event.save();
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('CREATE EVENT ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllEvents = async (req, res) => {
    try {
      const events = await Event.find();
      res.json({ events });
    } catch (error) {
      console.error('GET ALL EVENTS ERROR', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };