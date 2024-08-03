const paypal = require('@paypal/checkout-server-sdk');
const Transaction = require('../Models/transaction.model');
const User = require('../Models/user.model');
const collaborator = require('../Models/collaborator.model');
const { getClient, } = require('../Controller/config/TransactionConfig');
const { createPayout } = require('../Controller/config/TransactionService');
const axios = require('axios'); 
const Administrator = require('../Models/administrator.model');



const addFunds = async (req, res) => {
  try {
    const { amount, currency_code } = req.body;
    
    if (!currency_code || !amount) {
      return res.status(400).json({ error: 'Currency code and amount are required' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code,
          value: amount   
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
    console.error('Error in addFunds:', err); 
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
    console.log('Capture response:', JSON.stringify(capture, null, 2)); 

    if (capture.result.status === 'COMPLETED') {
      const purchaseUnit = capture.result.purchase_units[0];
      const captureDetails = purchaseUnit.payments.captures[0];
      const amountValue = captureDetails.amount.value;
      const currencyCode = captureDetails.amount.currency_code;

      if (!amountValue || !currencyCode) {
        return res.status(500).json({ error: 'Amount or currency code not found in the capture response' });
      }

      // Retrieve user details
      const user = await User.findById(userId);
      const userCurrencyCode = user.currencyCode || newCurrencyCode; 

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

// const sendMoney = async (req, res) => {
//   const {id} = req.params
//   try {
//     const { senderId, receiverEmail, amount, currencyCode } = req.body;
//     if(senderId!==id)
//     {
//       return res.status(400).json({ error: 'Sender id not match' });
//     }
//     if (!amount || amount <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     // Find sender
//     const sender = await User.findById(senderId);
//     if (!sender) return res.status(400).json({ error: 'Sender not found' });

//     // Convert sender's balance to the target currency if necessary
//     const senderCurrencyCode = sender.currencyCode;
//     let convertedAmount = amount;
//     if (senderCurrencyCode !== currencyCode) {
//       try {
//         convertedAmount = await convertCurrency(amount, currencyCode, senderCurrencyCode);
//       } catch (error) {
//         return res.status(500).json({ error: 'Sender currency conversion failed' });
//       }
//     }

//     if (sender.balance < convertedAmount) return res.status(400).json({ error: 'Insufficient balance' });

//     // Find receiver
//     let receiver = await User.findOne({ email: receiverEmail });
//     let receiverType = 'User'; // Default type

//     if (!receiver) {
//       receiver = await collaborator.findOne({ email: receiverEmail });
//       if (!receiver) return res.status(400).json({ error: 'Receiver not found' });
//       receiverType = 'PitikliniCollaborator'; // Update type if receiver is a collaborator
//     }

//     // Convert the amount to the receiver's currency if necessary
//     const receiverCurrencyCode = receiver.currencyCode;
//     let receiverAmount = amount;
//     if (currencyCode !== receiverCurrencyCode) {
//       try {
//         receiverAmount = await convertCurrency(amount, currencyCode, receiverCurrencyCode);
//       } catch (error) {
//         return res.status(500).json({ error: 'Receiver currency conversion failed' });
//       }
//     }
//     // const admin = await Administrator.findOne({email:'daltondorimon@gmail.com'}); // Assuming you have a role field
//     // if (!admin) return res.status(500).json({ error: 'Administrator not found' });
//     // Update balances
//     sender.balance -= convertedAmount;
//     await sender.save();

//     receiver.balance += receiverAmount;
//     await receiver.save();

//     // Record transaction
//     await new Transaction({
//       sender: sender._id,
//       senderName:sender.firstName,
//       senderLastName:sender.lastName,
//       senderEmail:sender.email,
//       receiver: receiver._id,
//       receiverEmail:receiver.email,
//       receiverName:receiver.firstName,
//       receiverLastName:receiver.lastName,
//       receiverType: receiverType, // Set receiverType field
//       amount: amount,
//       currency: currencyCode, // Record the currency of the transaction
//     }).save();

//     // Success response
//     res.json({ message: 'Transaction completed successfully' });

//   } catch (error) {
//     console.error('Error in sendMoney:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const sendMoney = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { senderId, receiverEmail, amount, currencyCode } = req.body;
//     if (senderId !== id) {
//       return res.status(400).json({ error: 'Sender id not match' });
//     }
//     if (!amount || amount <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     // Find sender
//     const sender = await User.findById(senderId);
//     if (!sender) return res.status(400).json({ error: 'Sender not found' });

//     // Calculate the 2% transaction fee
//     const feePercentage = 0.02;
//     const feeAmount = amount * feePercentage;

//     // Convert sender's balance to the target currency if necessary
//     const senderCurrencyCode = sender.currencyCode;
//     let convertedAmount = amount + feeAmount;
//     if (senderCurrencyCode !== currencyCode) {
//       try {
//         convertedAmount = await convertCurrency(amount + feeAmount, currencyCode, senderCurrencyCode);
//       } catch (error) {
//         return res.status(500).json({ error: 'Sender currency conversion failed' });
//       }
//     }

//     if (sender.balance < convertedAmount) return res.status(400).json({ error: 'Insufficient balance' });

//     // Find receiver
//     let receiver = await User.findOne({ email: receiverEmail });
//     let receiverType = 'User'; // Default type

//     if (!receiver) {
//       receiver = await Collaborator.findOne({ email: receiverEmail });
//       if (!receiver) return res.status(400).json({ error: 'Receiver not found' });
//       receiverType = 'PitikliniCollaborator'; // Update type if receiver is a collaborator
//     }

//     // Convert the amount to the receiver's currency if necessary
//     const receiverCurrencyCode = receiver.currencyCode;
//     let receiverAmount = amount;
//     if (currencyCode !== receiverCurrencyCode) {
//       try {
//         receiverAmount = await convertCurrency(amount, currencyCode, receiverCurrencyCode);
//       } catch (error) {
//         return res.status(500).json({ error: 'Receiver currency conversion failed' });
//       }
//     }

//     // Find administrator
//     const admin = await Administrator.findOne({ email: 'daltondorimon@gmail.com' }); // Replace with actual admin email
//     if (!admin) return res.status(500).json({ error: 'Administrator not found' });

//     // Convert the fee to the administrator's currency if necessary
//     const adminCurrencyCode = admin.currencyCode;
//     let adminFeeAmount = feeAmount;
//     if (currencyCode !== adminCurrencyCode) {
//       try {
//         adminFeeAmount = await convertCurrency(feeAmount, currencyCode, adminCurrencyCode);
//       } catch (error) {
//         return res.status(500).json({ error: 'Admin currency conversion failed' });
//       }
//     }

//     // Update balances
//     sender.balance -= convertedAmount;
//     await sender.save();

//     receiver.balance += receiverAmount;
//     await receiver.save();

//     admin.balance += adminFeeAmount;
//     await admin.save();

//     // Record transaction
//     await new Transaction({
//       sender: sender._id,
//       senderName: sender.firstName,
//       senderLastName: sender.lastName,
//       senderEmail: sender.email,
//       receiver: receiver._id,
//       receiverEmail: receiver.email,
//       receiverName: receiver.firstName,
//       receiverLastName: receiver.lastName,
//       receiverType: receiverType, // Set receiverType field
//       amount: amount,
//       currency: currencyCode, // Record the currency of the transaction
//       fee: feeAmount, // Record the fee amount
//     }).save();

//     // Success response
//     res.json({ message: 'Transaction completed successfully' });

//   } catch (error) {
//     console.error('Error in sendMoney:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const sendMoney = async (req, res) => {
  const { id } = req.params;
  try {
    const { senderId, receiverEmail, amount, currencyCode } = req.body;
    if (senderId !== id) {
      return res.status(400).json({ error: 'Sender id does not match' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Find sender
    const sender = await User.findById(senderId);
    if (!sender) return res.status(400).json({ error: 'Sender not found' });

    // Calculate the 2% transaction fee
    const feePercentage = 0.02;
    const feeAmount = amount * feePercentage;
    const amountAfterFee = amount - feeAmount;

    // Convert sender's balance to the target currency if necessary
    const senderCurrencyCode = sender.currencyCode;
    let convertedAmount = amountAfterFee;
    let convertedFeeAmount = feeAmount;
    if (senderCurrencyCode !== currencyCode) {
      try {
        // Convert amountAfterFee to sender's currency
        convertedAmount = await convertCurrency(amountAfterFee, currencyCode, senderCurrencyCode);
        // Convert feeAmount to sender's currency
        convertedFeeAmount = await convertCurrency(feeAmount, currencyCode, senderCurrencyCode);
      } catch (error) {
        return res.status(500).json({ error: 'Sender currency conversion failed' });
      }
    }

    const totalDeduction = convertedAmount + convertedFeeAmount;
    if (sender.balance < totalDeduction) return res.status(400).json({ error: 'Insufficient balance' });

    // Find receiver
    let receiver = await User.findOne({ email: receiverEmail });
    let receiverType = 'User'; // Default type

    if (!receiver) {
      receiver = await collaborator.findOne({ email: receiverEmail });
      if (!receiver) return res.status(400).json({ error: 'Receiver not found' });
      receiverType = 'PitikliniCollaborator'; // Update type if receiver is a collaborator
    }

    // Convert the amount to the receiver's currency if necessary
    const receiverCurrencyCode = receiver.currencyCode;
    let receiverAmount = amountAfterFee;
    if (currencyCode !== receiverCurrencyCode) {
      try {
        receiverAmount = await convertCurrency(amountAfterFee, currencyCode, receiverCurrencyCode);
      } catch (error) {
        return res.status(500).json({ error: 'Receiver currency conversion failed' });
      }
    }

    // Find administrator
    const admin = await Administrator.findOne({ email: 'daltondorimon@gmail.com' }); // Replace with actual admin email
    if (!admin) return res.status(500).json({ error: 'Administrator not found' });

    // Convert the fee to the administrator's currency if necessary
    const adminCurrencyCode = admin.currencyCode;
    let adminFeeAmount = feeAmount;
    if (currencyCode !== adminCurrencyCode) {
      try {
        adminFeeAmount = await convertCurrency(feeAmount, currencyCode, adminCurrencyCode);
      } catch (error) {
        return res.status(500).json({ error: 'Admin currency conversion failed' });
      }
    }

    // Update balances
    sender.balance -= totalDeduction;
    await sender.save();

    receiver.balance += receiverAmount;
    await receiver.save();

    admin.balance += adminFeeAmount;
    await admin.save();

    // Record transaction
    await new Transaction({
      sender: sender._id,
      senderName: sender.firstName,
      senderLastName: sender.lastName,
      senderEmail: sender.email,
      receiver: receiver._id,
      receiverEmail: receiver.email,
      receiverName: receiver.firstName,
      receiverLastName: receiver.lastName,
      receiverType: receiverType, // Set receiverType field
      amount: amountAfterFee,
      currency: currencyCode, // Record the currency of the transaction
      fee: feeAmount, // Record the fee amount
    }).save();

    // Success response
    res.json({ message: 'Transaction completed successfully' });

  } catch (error) {
    console.error('Error in sendMoney:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const getTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const transactions = await Transaction.find({ sender: id });
    
    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const formattedTransactions = transactions.map(transaction => ({
      SenderId: transaction.sender,
      ReceiverId: transaction.receiver,
      TransactionCurrency: transaction.currency,
      TransactionAmount: transaction.amount,
      senderName:transaction.senderName,
      senderLastName:transaction.senderLastName,
      senderEmail:transaction.senderEmail,
      ReciverEmail:transaction.receiverEmail,
      receiverName:transaction. receiverName,
      receiverLastName:transaction.receiverLastName,
      Date: transaction.date
    }));

    return res.json({ data: formattedTransactions });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


const getNewUserTransaction = async (req, res) => {
  try {
      const transactions = await Transaction.find({});
      if (!transactions || transactions.length === 0) {
          return res.status(404).json({ message: "Transactions not found" });
      }
      const data = transactions.map(transaction => ({
        SenderId: transaction.sender,
        ReceiverId: transaction.receiver,
        TransactionCurrency: transaction.currency,
        TransactionAmount: transaction.amount,
        senderName:transaction.senderName,
        senderLastName:transaction.senderLastName,
        senderEmail:transaction.senderEmail,
        ReciverEmail:transaction.receiverEmail,
        receiverName:transaction. receiverName,
        receiverLastName:transaction.receiverLastName,
        Date: transaction.date
      }));
      return res.status(200).json({ data });
  } catch (error) {
      return res.status(500).json({ message: "Error retrieving transactions", error: error.message });
  }
};

module.exports = {
  sendMoney,
  addFunds,
  captureFunds,
  getTransaction,
  getNewUserTransaction
};
