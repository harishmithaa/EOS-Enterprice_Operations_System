const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    rawMaterialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial'
    },
    action: {
        type: String,
        enum: ['ADD', 'SALE', 'ORDER', 'ADJUSTMENT', 'PRODUCTION'],
        required: true
    },
    quantityChange: {
        type: Number,
        required: true
    },
    reason: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
