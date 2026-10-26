const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', authenticateAdmin, getActivityLogs);

module.exports = router;
