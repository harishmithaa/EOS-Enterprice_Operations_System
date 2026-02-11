const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['LOW_STOCK', 'SUMMARY', 'SALE', 'ORDER', 'SYSTEM'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId // Can reference Product, Order, etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
