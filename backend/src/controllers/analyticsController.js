const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Total Sales Today
        const salesToday = await Sale.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    saleDate: { $gte: today },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' },
                },
            },
        ]);

        // Total Sales This Month
        const salesMonth = await Sale.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    saleDate: { $gte: firstDayOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' },
                    totalProfit: { $sum: '$totalProfit' },
                },
            },
        ]);

        // Total Products
        const totalProducts = await Product.countDocuments({ userId: req.user._id });

        // Low Stock Products
        const lowStockProducts = await Product.find({
            userId: req.user._id,
            $expr: { $lte: ['$stockQuantity', '$minimumStockThreshold'] },
        });

        // Daily Sales Chart Data (Last 7 Days)
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6);

        const dailySales = await Sale.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    saleDate: { $gte: last7Days },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                    sales: { $sum: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            salesToday: salesToday[0]?.totalAmount || 0,
            salesMonth: salesMonth[0]?.totalAmount || 0,
            profitMonth: salesMonth[0]?.totalProfit || 0, // Fix key access
            totalProducts,
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            dailySales,
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500);
        throw new Error('Failed to fetch analytics data');
    }
});



// @desc    Get sales trends
// @route   GET /api/analytics/trends
// @access  Private
const getSalesTrends = asyncHandler(async (req, res) => {
    const { period, productId, category, startDate: customStart, endDate: customEnd } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date();
    // Default to 30 days
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    if (customStart && customEnd) {
        startDate = new Date(customStart);
        startDate.setHours(0, 0, 0, 0);
        today.setTime(new Date(customEnd).getTime());
        today.setHours(23, 59, 59, 999);
    } else if (period === '7days') {
        startDate = new Date();
        startDate.setDate(today.getDate() - 6); // Last 7 days including today
        startDate.setHours(0, 0, 0, 0);
    } else if (period === '30days') {
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    } else if (period === '90days') {
        startDate = new Date();
        startDate.setDate(today.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'year') {
        startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
    }

    let matchStage = {
        userId: req.user._id,
        saleDate: { $gte: startDate, $lte: today }
    };

    // If filtering by product or category, we need to inspect items
    // But Sale model has items array. 
    // To filter "Sale" by product, we strictly should only count the portion of the sale that is that product?
    // The user asked for "sales trend", usually implies revenue from that product.
    // So we need to unwind items if filtering.

    let pipeline = [
        { $match: matchStage }
    ];

    if (productId || category) {
        pipeline.push({ $unwind: '$items' });

        if (productId) {
            pipeline.push({
                $match: { 'items.productId': new mongoose.Types.ObjectId(productId) }
            });
        }

        if (category) {
            // Need to lookup product to check category
            pipeline.push({
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            });
            pipeline.push({ $unwind: '$productDetails' });
            pipeline.push({
                $match: { 'productDetails.category': category }
            });
        }
    }

    pipeline.push({
        $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
            amount: {
                $sum: (productId || category) ? '$items.subtotal' : '$totalAmount'
            },
            profit: {
                $sum: (productId || category) ? '$items.profit' : '$totalProfit'
            }
        }
    });

    pipeline.push({ $sort: { _id: 1 } });

    const trends = await Sale.aggregate(pipeline);

    res.json(trends);
});

module.exports = {
    getDashboardStats,
    getSalesTrends
};
