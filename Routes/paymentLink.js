const express = require('express');
const router = express.Router();
const PaymentLink = require('../Models/paymentLink.model');
const Collaborator = require('../Models/collaborator.model');
const stripe = require('stripe')('sk_test_51PDchJ09iEbiKxfWR8txpYaoBUKOZfxUWIaKqVxfQYTcNE2hT8glN6K4m2oXvZ2e4TGgePol5HUXsyMoEjZsBbQ600U4SbAM1s');

// Generate payment link
router.post('/generate-payment-link', async (req, res) => {
    const { collaboratorId, amount } = req.body;

    try {
        const newPaymentLink = new PaymentLink({
            collaboratorId,
            amount
        });
        await newPaymentLink.save();
        
        const paymentLink = `http://localhost:3000/link/payment/${newPaymentLink._id}`;
        res.status(201).json({ paymentLink });
    } catch (error) {
        res.status(500).json({ message: 'Error generating payment link', error });
    }
});

// Fetch payment link details
router.get('/payment-link/:id', async (req, res) => {
    try {
        const paymentLink = await PaymentLink.findById(req.params.id);
        if (!paymentLink) {
            return res.status(404).json({ message: 'Payment link not found' });
        }
        res.status(200).json(paymentLink);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment link details', error });
    }
});

// Handle payment
router.post('/complete-payment', async (req, res) => {
    const { paymentLinkId, token } = req.body;

    try {
        const paymentLink = await PaymentLink.findById(paymentLinkId);

        if (!paymentLink || paymentLink.status !== 'pending') {
            return res.status(400).json({ message: 'Invalid or already completed payment link' });
        }

        // Charge the payment
        const charge = await stripe.charges.create({
            amount: paymentLink.amount * 100, // amount in cents
            currency: 'usd',
            source: token,
            description: `Payment for ${paymentLinkId}`
        });

        // Update payment link status
        paymentLink.status = 'completed';
        await paymentLink.save();

        // Update collaborator balance
        const collaborator = await Collaborator.findById(paymentLink.collaboratorId);
        collaborator.balance += paymentLink.amount;
        await collaborator.save();

        res.status(200).json({ message: 'Payment completed and credited to collaborator account' });
    } catch (error) {
        res.status(500).json({ message: 'Error completing payment', error });
    }
});

module.exports = router;
