// // controllers/rechargeController.js

// const axios = require('axios');
// const User = require('../Models/user.model'); // Assuming you have a User model
// const { deductBalance } = require('./wallet.controller');
// const { convertCurrency } = require('./currency.controller');

// exports.rechargePhone = async (userId, { phoneNumber, amount, currency }) => {
//   const user = await User.findById(userId);

//   if (!user) {
//     throw new Error('User not found');
//   }

//   const walletCurrency = user.currency || 'USD'; // Assume user's wallet currency is USD if not set

//   // Convert amount to user's wallet currency if needed
//   let amountInWalletCurrency = amount;
//   if (currency !== walletCurrency) {
//     amountInWalletCurrency = await convertCurrency(amount, currency, walletCurrency);
//   }

//   // Deduct balance
//   const updatedBalance = await deductBalance(userId, amountInWalletCurrency);

//   // Debugging: Log before making the API request
//   console.log('Making API request to Innoveri:', {
//     api_key: process.env.INNOVERI_API_KEY,
//     phone_number: phoneNumber,
//     amount: amount,
//   });

//   // Call Innoveri API
//   try {
//     const response = await axios.post('https://api.innoverit.com/v2/recharge', {
//       api_key: process.env.INNOVERI_API_KEY,
//       phone_number: phoneNumber,
//       amount: amount,
//     });

//     // Debugging: Log the response from the API
//     console.log('API response:', response.data);

//     if (response.data.status !== 'success') {
//       throw new Error('Recharge failed');
//     }

//     return {
//       updatedBalance,
//       rechargeStatus: response.data,
//     };
//   } catch (error) {
//     console.error('API request failed:', error.message);
//     throw new Error('Recharge failed due to API error');
//   }
// };


const axios = require('axios');

exports.authenticate = async (req, res) => {
    try {
        const response = await axios.post('https://api.innoverit.com/auth', {}, {
            headers: {
                'Authorization': `Bearer ${process.env.INNOVERIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendSMS = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        const response = await axios.post('https://api.innoverit.com/sms', {
            phoneNumber,
            message
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.INNOVERIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rechargePhone = async (req, res) => {
    try {
        const { phoneNumber, amount } = req.body;
        const response = await axios.post('https://api.innoverit.com/recharge', {
            phoneNumber,
            amount
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.INNOVERIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
