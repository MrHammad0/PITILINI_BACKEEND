const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_SANDBOX_CLIENT_ID,
  client_secret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET
});

const createPayout = async (payout) => {
  return new Promise((resolve, reject) => {
    paypal.payout.create(payout, function (error, payout) {
      if (error) {
        reject(error);
      } else {
        resolve(payout);
      }
    });
  });
};

module.exports = {
  createPayout
};
