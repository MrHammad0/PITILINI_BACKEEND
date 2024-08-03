const express = require('express');
const { sendMoney, addFunds, captureFunds } = require('../Controller/administratorTransaction.controller');
const administratorTransactionrouter = express.Router();

administratorTransactionrouter.post('/administrator-send-money/:id', sendMoney);
administratorTransactionrouter.post('/administrator-add-funds', addFunds);
administratorTransactionrouter.post('/administrator-capture-funds', captureFunds);

module.exports = administratorTransactionrouter;
