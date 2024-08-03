// models/BalanceHistory.js
const mongoose = require('mongoose');

const balanceHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const BalanceHistory = mongoose.model('BalanceHistory', balanceHistorySchema);

module.exports = BalanceHistory;
