// controllers/currencyController.js

const axios = require('axios');

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

module.exports = {
  convertCurrency,
};
