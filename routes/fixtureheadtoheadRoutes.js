const express = require('express');
const router = express.Router();
const fixturesHeadToHeadController = require('../controllers/fixturesHeadToHeadController');
const auth = require('../middleware/auth');

router.get('/', auth, fixturesHeadToHeadController.fixturesHeadToHead);

module.exports = router;
