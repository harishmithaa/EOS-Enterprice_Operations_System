const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    minimumStockThreshold: { type: Number, default: 10 },
    imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
