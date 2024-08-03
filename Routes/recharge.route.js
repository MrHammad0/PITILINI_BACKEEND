// // routes/recharge.js

// const express = require('express');
// const router = express.Router();
// const { rechargePhone } = require('../Controller/recharge.controller');

// router.post('/phone', async (req, res) => {
//   try {
//     const { userId, phoneNumber, amount, currency } = req.body;
//     const result = await rechargePhone(userId, { phoneNumber, amount, currency });
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const telecomController = require('../Controller/recharge.controller');

// Route to authenticate and get token
router.post('/auth', telecomController.authenticate);

// Route to send SMS
router.post('/sendSMS', telecomController.sendSMS);

// Route to recharge phone
router.post('/recharge', telecomController.rechargePhone);

module.exports = router;
