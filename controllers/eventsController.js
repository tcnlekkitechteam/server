const Event = require('../models/event');

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

exports.getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Query upcoming events (events with date greater than or equal to current date)
    const upcomingEvents = await Event.find({ date: { $gte: currentDate } });
    console.log('upcoming found')
    
    // Check if arrays is empty and return empty arrays if so
    if (upcomingEvents.length === 0) {
      return res.json({ upcomingEvents: []});
    }

    res.json({ upcomingEvents});
  } catch (error) {
    console.error('GET UPCOMING EVENTS ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getRecentEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Query recent events (events with date less than current date)
    const recentEvents = await Event.find({ date: { $lt: currentDate } });
 
    // Check if both arrays are empty and return empty arrays if so
    if (recentEvents.length === 0) {
      return res.json({ recentEvents: [] });
    }

    res.json({ recentEvents });
  } catch (error) {
    console.error('GET RECENT EVENTS ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEventsById = async (req, res) => {
  try {
    if (!req?.params?.id)
    return res.status(400).json({ message: "Event ID required." });

  const event = await Event.findOne({ _id: req.params.id }).exec();
  if (!event) {
    return res
      .status(204)
      .json({ message: `No event matches ID ${req.params.id}.` });
  }
  return res.json(event);
  } catch (error) {
    console.error('GET EVENTS BY ID ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTodayEvents = async (req, res) => {
  try {
    // current date
    const currentDate = new Date();

    // Calculate the start and end of the current day
    const startOfDay = new Date(currentDate.setHours(0, 0, 0)).toISOString()
    const endOfDay = new Date(new Date(currentDate).setHours(24, 0, 0)).toISOString();
    
    // Query today's events (events with date equal to current date)
    const TodayEvents = await Event.find({
      date: {$gt: startOfDay, $lt: endOfDay}
    });
    
    
    // Check if arrays is empty and return empty arrays if so
    if (TodayEvents.length === 0) {
      return res.json({ TodayEvents: [] });
    }

    return res.json({ TodayEvents });
  } catch (error) {
    console.error('GET EVENTS BY CATEGORY ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.DeleteEventsById = async (req, res) => {
  try {
    if (!req?.params?.id)
    return res.status(400).json({ message: "Event ID required." });

  const deletedEvent = await Event.deleteOne({ _id: req.params.id }).exec();
  if (!deletedEvent.acknowledged) {
    return res
      .status(204)
      .json({ message: `No event matches ID ${req.params.id}.` });
  }
  return res.json(deletedEvent.acknowledged);
  } catch (error) {
    console.error('DELETE EVENTS BY ID ERROR', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateEvent = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  const event = await Event.findOne({ _id: req.params.id }).exec();
  if (!event) {
    return res
      .status(204)
      .json({ message: `No event matches ID ${req.body.id}.` });
  }
  if (req.body?.eventName) event.eventName = req.body.eventName;
  if (req.body?.date) event.date = req.body.date;
  if (req.body?.time) event.time = req.body.time;
  if (req.body?.registrationLink) event.registrationLink = req.body.registrationLink;
  if (req.body?.image) event.image = req.body.image;

  const result = await event.updateOne(event);
  res.json(result);
};