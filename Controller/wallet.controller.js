// controllers/walletController.js

const User = require('../Models/user.model'); // Assuming you have a User model

const deductBalance = async (userId, amount) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.balance < amount) {
    throw new Error('Insufficient balance');
  }

  user.balance -= amount;
  await user.save();

  return user.balance;
};

module.exports = {
  deductBalance,
};
