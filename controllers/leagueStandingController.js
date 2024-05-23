const LeagueStandingService = require('../services/leagueStandingService');
const axios = require('axios');
const url = require('url');

exports.leagueStanding = async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const leagueStandingService = new LeagueStandingService();

  try {
    const leagueStanding = await leagueStandingService.leagueStanding(queryObject);
    const re = [];
    for (const item of leagueStanding) {
      await re.push(JSON.parse(item));
  }


    res.status(200).send(re);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};










