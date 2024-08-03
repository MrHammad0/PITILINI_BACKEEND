const paypal = require('@paypal/checkout-server-sdk');
const Transaction = require('../Models/AdministratorTransaction.model');
const User = require('../Models/user.model');
const collaborator = require('../Models/collaborator.model');
const { getClient, } = require('../Controller/config/TransactionConfig');
const axios = require('axios'); // For making API requests
const Administrator = require('../Models/administrator.model');

const addFunds = async (req, res) => {
  try {
    // Destructure amount and currency_code from the request body
    const { amount, currency_code } = req.body;
    
    // Validate currency_code
    if (!currency_code || !amount) {
      return res.status(400).json({ error: 'Currency code and amount are required' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code, // Use currency_code from the request body
          value: amount   // Use amount from the request body
        }
      }]
    });

    const client = getClient();
    const order = await client.execute(request);
    res.json({
      id: order.result.id,
      status: order.result.status,
      links: order.result.links
    });
  } catch (err) {
    console.error('Error in addFunds:', err); // Log error for debugging
    res.status(500).json({ error: err.message });
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = response.data.rates[toCurrency];
    if (!rate) throw new Error(`Conversion rate not found for ${toCurrency}`);
    return amount * rate;
  } catch (error) {
    console.error(`Currency conversion error: ${error.message}`);
    throw new Error('Currency conversion failed');
  }
};

const captureFunds = async (req, res) => {
  const { orderId, userId, newCurrencyCode } = req.body; // Include newCurrencyCode in the request body
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  
  try {
    const capture = await getClient().execute(request);
    console.log('Capture response:', JSON.stringify(capture, null, 2)); // Log for debugging

    if (capture.result.status === 'COMPLETED') {
      const purchaseUnit = capture.result.purchase_units[0];
      const captureDetails = purchaseUnit.payments.captures[0];
      const amountValue = captureDetails.amount.value;
      const currencyCode = captureDetails.amount.currency_code;

      if (!amountValue || !currencyCode) {
        return res.status(500).json({ error: 'Amount or currency code not found in the capture response' });
      }

      // Retrieve user details
      const user = await Administrator.findById(userId);
      const userCurrencyCode = user.currencyCode || newCurrencyCode; // Default to newCurrencyCode if not set

      // Convert the existing balance to the new currency if the balance is greater than 0
      let convertedExistingBalance = user.balance || 0;
      if (user.balance > 0 && userCurrencyCode !== newCurrencyCode) {
        try {
          convertedExistingBalance = await convertCurrency(user.balance, userCurrencyCode, newCurrencyCode);
        } catch (error) {
          return res.status(500).json({ error: 'Existing balance conversion failed' });
        }
      }

      // Convert the captured amount to the new currency
      let convertedAmount = parseFloat(amountValue);
      if (currencyCode !== newCurrencyCode) {
        try {
          convertedAmount = await convertCurrency(convertedAmount, currencyCode, newCurrencyCode);
        } catch (error) {
          return res.status(500).json({ error: 'Currency conversion failed' });
        }
      }

      // Update user's balance and currency code
      user.balance = convertedExistingBalance + convertedAmount;
      user.currencyCode = newCurrencyCode;
      await user.save();

      res.json({
        status: 'Funds added successfully',
        user
      });
    } else {
      res.status(500).json({ error: 'Funds capture failed' });
    }
  } catch (err) {
    if (err.statusCode === 422 && err.message.includes('ORDER_ALREADY_CAPTURED')) {
      res.status(400).json({ error: 'Order already captured' });
    } else {
      console.error('Error in captureFunds:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

const sendMoney = async (req, res) => {
  const {id} = req.params;
  try {
    const { senderId, receiverEmail, amount, currencyCode } = req.body;
    if(senderId!==id)
      {
        return res.status(400).json({ error: 'Sender id not match' });
      }
    // Input validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find sender
    const sender = await Administrator.findById(senderId);
    if (!sender) return res.status(400).json({ error: 'Sender not found' });

    // Convert sender's balance to the target currency if necessary
    const senderCurrencyCode = sender.currencyCode;
    let convertedAmount = amount;
    if (senderCurrencyCode !== currencyCode) {
      try {
        convertedAmount = await convertCurrency(amount, currencyCode, senderCurrencyCode);
      } catch (error) {
        return res.status(500).json({ error: 'Sender currency conversion failed' });
      }
    }

    if (sender.balance < convertedAmount) return res.status(400).json({ error: 'Insufficient balance' });

    // Find receiver
    let receiver = await User.findOne({ email: receiverEmail });
    let receiverType = 'User'; // Default type

    if (!receiver) {
      receiver = await collaborator.findOne({ email: receiverEmail });
      receiverType = 'PitikliniCollaborator';
       // Update type if receiver is a collaborator
       if (!receiver) {
        receiver = await Administrator.findOne({ email: receiverEmail });
        receiverType = 'Administrator'; // Update type if receiver is a collaborator
      }
      if (!receiver) return res.status(400).json({ error: 'Receiver not found' });
    }

    // Convert the amount to the receiver's currency if necessary
    const receiverCurrencyCode = receiver.currencyCode;
    let receiverAmount = amount;
    if (currencyCode !== receiverCurrencyCode) {
      try {
        receiverAmount = await convertCurrency(amount, currencyCode, receiverCurrencyCode);
      } catch (error) {
        return res.status(500).json({ error: 'Receiver currency conversion failed' });
      }
    }

    // Update balances
    sender.balance -= convertedAmount;
    await sender.save();

    receiver.balance += receiverAmount;
    await receiver.save();

    // Record transaction
    await new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      receiverType: receiverType, // Set receiverType field
      amount: amount,
      currency: currencyCode, // Record the currency of the transaction
    }).save();

    // Success response
    res.json({ message: 'Transaction completed successfully' });

  } catch (error) {
    console.error('Error in sendMoney:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendMoney,
  addFunds,
  captureFunds
};
