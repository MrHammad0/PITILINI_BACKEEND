// const axios = require('axios');

// const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY;
// const CHATBOT_API_URL = process.env.CHATBOT_API_URL;

// exports.getChatbotResponse = async (req, res) => {
//     const userMessage = req.body.message;

//     try {
//         const response = await axios.post(CHATBOT_API_URL, {
//             prompt: userMessage,
//             max_tokens: 150,
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${CHATBOT_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         const chatbotMessage = response.data.choices[0].text.trim();
//         res.json({ message: chatbotMessage });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong!' });
//     }
// };
