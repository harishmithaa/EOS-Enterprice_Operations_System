const express = require('express');
const router = express.Router();
const { getStockLogs } = require('../controllers/stockLogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStockLogs);

module.exports = router;
