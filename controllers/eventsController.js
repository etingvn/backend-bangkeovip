const EventsService = require('../services/eventsService');
const axios = require('axios');
const url = require('url');

exports.events = async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const eventsService = new EventsService();

  try {
    const events = await eventsService.events(queryObject);
    const re = [];
    for (const item of events) {
      await re.push(JSON.parse(item));
  }
    res.status(200).send(re);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};










