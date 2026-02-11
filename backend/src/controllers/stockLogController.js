const asyncHandler = require('express-async-handler');
const StockLog = require('../models/StockLog');

// @desc    Get stock logs
// @route   GET /api/stock-logs
// @access  Private
const getStockLogs = asyncHandler(async (req, res) => {
    const logs = await StockLog.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .populate('productId', 'name')
        .populate('rawMaterialId', 'name');
    res.json(logs);
});

module.exports = {
    getStockLogs
};
