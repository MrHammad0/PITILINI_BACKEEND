// controllers/balanceHistoryController.js
const BalanceHistory = require('../Models/balanceHistory.model');

// Fetch balance history for a user
const getBalanceHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const history = await BalanceHistory.find({ userId }).sort({ date: 1 });

    if (!history) {
      return res.status(404).json({ message: 'Balance history not found' });
    }

    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching balance history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getBalanceHistory,
};
