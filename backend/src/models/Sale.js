const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    saleDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    shippingAmount: { type: Number, default: 0 },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        costPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        profit: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
