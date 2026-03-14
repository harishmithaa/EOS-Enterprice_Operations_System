const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Notification = require('../models/Notification');

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
    const { items, saleDate } = req.body; // items: [{ productId, quantity }]

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items in sale');
    }

    let totalAmount = 0;
    let totalProfit = 0;
    const saleItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stockQuantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const subtotal = product.sellingPrice * item.quantity;
        const itemProfit = (product.sellingPrice - product.costPrice) * item.quantity;

        totalAmount += subtotal;
        totalProfit += itemProfit;

        saleItems.push({
            productId: product._id,
            quantity: item.quantity,
            sellingPrice: product.sellingPrice,
            costPrice: product.costPrice,
            subtotal,
            profit: itemProfit,
        });

        // Deduct stock
        product.stockQuantity -= item.quantity;
        await product.save();

        // Log Stock Change
        await StockLog.create({
            userId: req.user._id,
            productId: product._id,
            quantityChange: -item.quantity,
            action: 'SALE',
        });

        // Check Low Stock
        if (product.stockQuantity <= product.minimumStockThreshold) {
            await Notification.create({
                userId: req.user._id,
                message: `Low Stock Alert: Product ${product.name} is below threshold after sale.`,
                type: 'LOW_STOCK',
            });
        }
    }

    const sale = await Sale.create({
        userId: req.user._id,
        saleDate: saleDate || new Date(),
        totalAmount,
        totalProfit,
        items: saleItems,
    });

    res.status(201).json(sale);
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
    const { date, startDate, endDate } = req.query;
    let query = { userId: req.user._id };

    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        query.saleDate = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.saleDate = { $gte: start, $lte: end };
    }

    const sales = await Sale.find(query)
        .populate('items.productId', 'name')
        .sort({ saleDate: -1 });
    res.json(sales);
});

module.exports = {
    createSale,
    getSales,
};
