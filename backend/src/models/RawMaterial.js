const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true, // e.g., 'kg', 'ltr', 'pcs'
        enum: ['kg', 'liter', 'pcs', 'unit', 'box']
    },
    minimumStockThreshold: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
