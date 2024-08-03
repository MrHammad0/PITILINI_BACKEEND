const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Administrator', required: true },
  receiverType: { type: String, enum: ['PitikliniCollaborator','User','Administrator'], required: true }, 
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true }, 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdministratorTransaction', transactionSchema);
