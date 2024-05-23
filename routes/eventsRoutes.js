const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const auth = require('../middleware/auth');

router.get('/', eventsController.events);

module.exports = router;
