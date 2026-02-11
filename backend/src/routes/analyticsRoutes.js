const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesTrends } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/trends', protect, getSalesTrends);

module.exports = router;
