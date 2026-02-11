const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount: { type: Number, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Selling price at time of order
        subtotal: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
