const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverType: { type: String, enum: ['User', 'PitikliniCollaborator'], required: true }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }, 
  senderName:{ type: String, required: true },
  senderLastName:{ type: String, required: true },
  senderEmail:{ type: String, required: true },
  receiverEmail:{ type: String, required: true },
  receiverName:{ type: String, required: true },
  receiverLastName:{ type: String, required: true },
  receiverType: { type: String, required: true },
  adminFee:{ type: String }, 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
