// routes/balanceHistoryRoutes.js
const express = require('express');
const { getBalanceHistory } = require('../Controller/balanceHistory.controller');

const historyRouter = express.Router();

historyRouter.get('/balanceHistory/:id', getBalanceHistory);

module.exports = historyRouter;
