const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSale)
    .get(protect, getSales);

module.exports = router;
