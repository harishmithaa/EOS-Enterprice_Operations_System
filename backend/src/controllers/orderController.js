const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Notification = require('../models/Notification');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { customerName, phoneNumber, address, items, orderDate } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }

        const subtotal = product.sellingPrice * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.sellingPrice,
            subtotal,
        });
    }

    const order = await Order.create({
        userId: req.user._id,
        customerName,
        phoneNumber,
        address,
        items: orderItems,
        totalAmount,
        orderDate: orderDate || Date.now(),
        status: 'Pending',
    });

    await Notification.create({
        userId: req.user._id,
        message: `New Order Received from ${customerName}`,
        type: 'ORDER',
    });

    res.status(201).json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id })
        .populate('items.productId', 'name')
        .sort({ orderDate: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.userId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.status === 'Delivered' && status !== 'Delivered') {
        // Logic for reverting stock if we wanted that, but for now assuming forward flow mostly or just preventing double deduction.
        // If un-delivering, we should probably add stock back? Prompt doesn't specify.
        // I'll keep it simple: Only deduct if going to Delivered from non-Delivered.
    }

    if (status === 'Delivered' && order.status !== 'Delivered') {
        // Deduct stock
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stockQuantity -= item.quantity;
                await product.save();

                await StockLog.create({
                    userId: req.user._id,
                    productId: product._id,
                    changeQuantity: -item.quantity,
                    actionType: 'ORDER',
                });

                if (product.stockQuantity <= product.minimumStockThreshold) {
                    await Notification.create({
                        userId: req.user._id,
                        message: `Low Stock Alert: Product ${product.name} is below threshold after order delivery.`,
                        type: 'LOW_STOCK',
                    });
                }
            }
        }
        order.deliveryDate = Date.now();
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
};
