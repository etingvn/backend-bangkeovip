const express = require('express');
const router = express.Router();
const leagueStandingController = require('../controllers/leagueStandingController');
const auth = require('../middleware/auth');

//router.get('/', auth, fixturesAllByDateController.fixturesAllByDate);
router.get('/', leagueStandingController.leagueStanding);

module.exports = router;
