const mongoose = require('mongoose');

const paymentLinkSchema = new mongoose.Schema({
    collaboratorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'PitikliniCollaborator'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('PaymentLink', paymentLinkSchema);
