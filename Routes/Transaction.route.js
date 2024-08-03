const express = require('express');
const { sendMoney, addFunds, captureFunds, getTransaction, getNewUserTransaction } = require('../Controller/transaction.controller');
const TransactionRoute = express.Router();

TransactionRoute.post('/send-money/:id', sendMoney);
TransactionRoute.post('/add-funds', addFunds);
TransactionRoute.post('/capture-funds', captureFunds);
TransactionRoute.get('/get/successfull/transaction/:id', getTransaction);
TransactionRoute.get('/get/full/successfull/transaction', getNewUserTransaction);

module.exports = TransactionRoute;
