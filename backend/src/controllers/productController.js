const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const Notification = require('../models/Notification');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ userId: req.user._id });
    res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product && product.userId.toString() === req.user._id.toString()) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        description,
        sellingPrice,
        costPrice,
        stockQuantity,
        minimumStockThreshold,
    } = req.body;

    const product = new Product({
        userId: req.user._id,
        name,
        category,
        description,
        sellingPrice,
        costPrice,
        stockQuantity,
        minimumStockThreshold,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const createdProduct = await product.save();

    // Log initial stock
    if (stockQuantity > 0) {
        await StockLog.create({
            userId: req.user._id,
            productId: createdProduct._id,
            quantityChange: stockQuantity,
            action: 'ADD',
        });
    }

    if (createdProduct.stockQuantity <= createdProduct.minimumStockThreshold) {
        await Notification.create({
            userId: req.user._id,
            message: `Low Stock Alert: Product ${createdProduct.name} is below threshold.`,
            type: 'LOW_STOCK',
        });
    }

    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        description,
        sellingPrice,
        costPrice,
        stockQuantity,
        minimumStockThreshold,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product && product.userId.toString() === req.user._id.toString()) {
        product.name = name || product.name;
        product.category = category || product.category;
        product.description = description || product.description;
        product.sellingPrice = sellingPrice || product.sellingPrice;
        product.costPrice = costPrice || product.costPrice;
        product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
        product.minimumStockThreshold = minimumStockThreshold || product.minimumStockThreshold;
        if (req.file) {
            product.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Calculate stock change for logging
        const oldStock = await Product.findById(req.params.id).select('stockQuantity');
        const stockChange = stockQuantity !== undefined ? stockQuantity - oldStock.stockQuantity : 0;

        const updatedProduct = await product.save();

        if (stockChange !== 0) {
            await StockLog.create({
                userId: req.user._id,
                productId: updatedProduct._id,
                quantityChange: stockChange,
                action: 'ADJUSTMENT', // Manual update
            });
        }

        // Check low stock
        if (updatedProduct.stockQuantity <= updatedProduct.minimumStockThreshold) {
            await Notification.create({
                userId: req.user._id,
                message: `Low Stock Alert: Product ${updatedProduct.name} is below threshold.`,
                type: 'LOW_STOCK',
            });
        }

        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product && product.userId.toString() === req.user._id.toString()) {
        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
