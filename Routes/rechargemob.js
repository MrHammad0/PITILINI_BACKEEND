const express = require('express');
const mobRechargeRouter = express.Router();
const axios = require('axios');
const User = require('../Models/user.model'); // Assuming you have a User model

// Route to handle recharge
mobRechargeRouter.post('/recharge/phone', async (req, res) => {
  const { userId, phoneNumber, amount } = req.body;

  try {
    // Fetch user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= amount;
    await user.save();

    // Make recharge request to Innoverit API
    const response = await axios.post('https://api.innoverit.com/v2/recharge', {
      phoneNumber,
      amount,
      apiKey: '1312b1387dffcd8cb65e1570f1f159c8',
    });

    if (response.data.success) {
      return res.status(200).json({ message: 'Recharge successful', data: response.data });
    } else {
      // In case of recharge failure, refund the balance
      user.balance += amount;
      await user.save();
      return res.status(500).json({ message: 'Recharge failed', error: response.data.error });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = mobRechargeRouter;
