// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDb = require('./DB/db');
// const userRoute = require('./Routes/user.route');
// const collaboratorRoute = require('./Routes/collaborator.route');
// const kycRouter = require('./Routes/kyc.route');
// const bodyParser = require('body-parser');
// const subscriptionRoutes = require('./Routes/stripe.route');
// const TransactionRoute = require('./Routes/Transaction.route');
// const collaboratorTransactionRoute = require('./Routes/collaboratorTransaction.route');
// const rechargeRouter = require('./Routes/recharge.route');
// const administratorRoute = require('./Routes/administrator.route');
// const administratorTransactionrouter = require('./Routes/administratorTransaction.route');
// const historyRouter = require('./Routes/balanceHistory.route');
// const mobRechargeRouter = require('./Routes/rechargemob');
// const router = require('./Routes/paymentLink');
// // const chatRouter = require('./Routes/chat.route');

// const app = express();

// const port = process.env.PORT || 3400;

// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());
// connectDb();

// app.use('/api/v3', userRoute);
// app.use('/api/v3', collaboratorRoute);
// app.use('/api/v3', administratorRoute);
// app.use('/api/v3', kycRouter);
// app.use('/api/v3', subscriptionRoutes);
// app.use('/api/v3', TransactionRoute);
// app.use('/api/v3', collaboratorTransactionRoute);
// app.use('/api/v3', administratorTransactionrouter);
// app.use('/api/v3', rechargeRouter);
// app.use('/api/v3', mobRechargeRouter);
// app.use('/api/v3', historyRouter);
// app.use('/api/v3', router);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// // Add a simple GET route
// app.get('/', (req, res) => {
//     res.send('Hello, world!');
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./DB/db');
const userRoute = require('./Routes/user.route');
const collaboratorRoute = require('./Routes/collaborator.route');
const kycRouter = require('./Routes/kyc.route');
const bodyParser = require('body-parser');
const subscriptionRoutes = require('./Routes/stripe.route');
const TransactionRoute = require('./Routes/Transaction.route');
const collaboratorTransactionRoute = require('./Routes/collaboratorTransaction.route');
const rechargeRouter = require('./Routes/recharge.route');
const administratorRoute = require('./Routes/administrator.route');
const administratorTransactionrouter = require('./Routes/administratorTransaction.route');
const historyRouter = require('./Routes/balanceHistory.route');
const mobRechargeRouter = require('./Routes/rechargemob');
const router = require('./Routes/paymentLink');
// const chatRouter = require('./Routes/chat.route');

const app = express();

const port = process.env.PORT || 3400;

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: process.env.FRONT_END_URI , // Use FRONT_END_URI or allow all origins for debugging
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());

// Database connection
connectDb().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Routes setup
app.use('/api/v3', userRoute);
app.use('/api/v3', collaboratorRoute);
app.use('/api/v3', administratorRoute);
app.use('/api/v3', kycRouter);
app.use('/api/v3', subscriptionRoutes);
app.use('/api/v3', TransactionRoute);
app.use('/api/v3', collaboratorTransactionRoute);
app.use('/api/v3', administratorTransactionrouter);
app.use('/api/v3', rechargeRouter);
app.use('/api/v3', mobRechargeRouter);
app.use('/api/v3', historyRouter);
app.use('/api/v3', router);

// Root route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS setup to allow origin: ${process.env.FRONT_END_URI}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});
