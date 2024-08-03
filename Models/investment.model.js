const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  benefitRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  status: { type: String, default: 'active' },
});

module.exports = mongoose.model('Investment', investmentSchema);
