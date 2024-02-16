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
    let { page, limit } = req.query;

    // Default values if page or limit are not provided
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Query events with pagination
    const events = await Event.find()
      .skip(skip)
      .limit(limit);

    // Check if events array is empty and return an empty array if so
    if (events.length === 0) {
      return res.json({ events: [], page, limit });
    }

    res.json({ events, page, limit });
  } catch (error) {
    console.error('GET ALL EVENTS ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEventsByCategory = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Query upcoming events (events with date greater than or equal to current date)
    const upcomingEvents = await Event.find({ date: { $gte: currentDate } });
    console.log('upcoming found')
    // Query recent events (events with date less than current date)
    const recentEvents = await Event.find({ date: { $lt: currentDate } });
 
    // Check if both arrays are empty and return empty arrays if so
    if (upcomingEvents.length === 0 && recentEvents.length === 0) {
      return res.json({ upcomingEvents: [], recentEvents: [] });
    }

    res.json({ upcomingEvents, recentEvents });
  } catch (error) {
    console.error('GET EVENTS BY CATEGORY ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};