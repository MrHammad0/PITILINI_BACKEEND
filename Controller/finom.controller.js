const axios = require('axios');

const { FINOM_API_BASE_URL, API_KEY_Finom } = process.env;

const makeInternationalTransfer = async (req, res) => {
    try {
        const { recipientId, amount, currency, country } = req.body;
        
        // Validate request parameters if necessary

        const response = await axios.post(`${FINOM_API_BASE_URL}/international-transfers`, {
            recipientId,
            amount,
            currency,
            country
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY_Finom}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error making international transfer', error: error.message });
    }
};

module.exports = {
    makeInternationalTransfer
};
