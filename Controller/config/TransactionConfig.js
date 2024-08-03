const paypal = require('@paypal/checkout-server-sdk');

const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_SANDBOX_CLIENT_ID, process.env.PAYPAL_SANDBOX_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

const getClient = () => client;

const createPayout = async (payout) => {
  const request = new paypal.payouts.PayoutsPostRequest();
  request.requestBody(payout);
  return await client.execute(request);
};

module.exports = {
  getClient,
  createPayout
};
