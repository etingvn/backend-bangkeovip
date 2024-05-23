const express = require('express');
const router = express.Router();
const fixturesAllByDateController = require('../controllers/fixturesAllByDateController');
const auth = require('../middleware/auth');

//router.get('/', auth, fixturesAllByDateController.fixturesAllByDate);
router.get('/', fixturesAllByDateController.fixturesAllByDate);

module.exports = router;
