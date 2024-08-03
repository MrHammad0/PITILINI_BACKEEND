const express = require('express');
const router = express.Router();
const subscriptionController = require('../Controller/stripe.controller');
router.post('/create-subscription', subscriptionController.createSubscription);
router.post('/create-subscription-invetement', subscriptionController.createInvestmentSubscription);
router.post('/create-subscription/netflix', subscriptionController.createSubscriptionNetflix);
router.post('/create-payment-link', subscriptionController.createPaymentLink);

//MLC

router.post('/create-mlc-subscription', subscriptionController.createMlcSubscription);
router.post('/create/initial/USA/mlc/shipment', subscriptionController.initialMlcUsaShip);
router.get('/create/USA/mlc/shipment/:id', subscriptionController.MlcUsaShip);
router.post('/create/initial/Europe/mlc/shipment', subscriptionController.initialMlcEuropeShip);
router.get('/create/Europe/mlc/shipment/:id', subscriptionController.MlcEuropeShip);
router.get('/get/mlc/USA/ship', subscriptionController.getMlcSubscriptionUSAShip);
router.get('/get/mlc/Europe/ship', subscriptionController.getMlcSubscriptionEuropeShip);

//CUP

router.post('/create-CUP-subscription', subscriptionController.createCUPSubscription);
router.post('/create/initial/USA/CUP/shipment', subscriptionController.initialCUPUsaShip);
router.get('/create/USA/CUP/shipment/:id', subscriptionController.CUPUsaShip);
router.post('/create/initial/Europe/CUP/shipment', subscriptionController.initialCUPEuropeShip);
router.get('/create/Europe/CUP/shipment/:id', subscriptionController.CUPEuropeShip);
router.get('/get/CUP/USA/ship', subscriptionController.getCUPSubscriptionUSAShip);
router.get('/get/CUP/Europe/ship', subscriptionController.getCUPSubscriptionEuropeShip);
//USD

router.post('/create-USD-subscription', subscriptionController.createUSDSubscription);
router.post('/create/initial/USA/USD/shipment', subscriptionController.initialUSDUsaShip);
router.get('/create/USA/USD/shipment/:id', subscriptionController.USDUsaShip);
router.post('/create/initial/Europe/USD/shipment', subscriptionController.initialUSDEuropeShip);
router.get('/create/Europe/USD/shipment/:id', subscriptionController.USDEuropeShip);
router.get('/get/USD/USA/ship', subscriptionController.getUSDSubscriptionUSAShip);
router.get('/get/USD/Europe/ship', subscriptionController.getUSDSubscriptionEuropeShip);
module.exports = router;


