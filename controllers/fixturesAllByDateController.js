const FixturesAllByDateService = require('../services/fixturesAllByDateService');
const axios = require('axios');
const url = require('url');

exports.fixturesAllByDate = async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const fixturesAllByDateService = new FixturesAllByDateService();

  try {
    const fixturesAll = await fixturesAllByDateService.fixturesAllByDate(queryObject);
    const re = [];
    for (const item of fixturesAll) {
      await re.push(JSON.parse(item));
  }


    res.status(200).send(re);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};










