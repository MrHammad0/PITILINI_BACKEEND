const express = require('express');
const router = express.Router();
const kycController = require('../Controller/kyc.controller');

router.post('/kyc/upload/:userId', kycController.uploadDocuments);


module.exports = router;
