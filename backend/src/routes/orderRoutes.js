const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, getOrders);

router.route('/:id/status').put(protect, updateOrderStatus);

module.exports = router;
