const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PDchJ09iEbiKxfWcSP0Gpdox3yWgDkbiSqISIwLirwN5vT9pxz8rYMP85zH6K4l9xoirWQNiJN9UcqqWzwrAPXH00H3dl7OeF'); // Replace with your Stripe Secret Key
const schedule = require('node-schedule'); // For scheduling tasks
const Investment = require('../Models/investment.model'); 
const { transporter } = require("../utils/email");
const initialUSAShipment = require('../Models/initialUsaShipment.model');
const USAShipment = require('../Models/usaShipment.model');
const initialEuropeShipment = require('../Models/initialEuropeShipment.model');
const EuropeShipment = require('../Models/europeShipment.model');
const initialUSAShipmentCUP = require('../Models/initialCUPShipmentUSA.model');
const USAShipmentCUP = require('../Models/CUPShipmentUSA.model');
const initialEuropeShipmentCUP = require('../Models/initialCUPShipmentEurope.model');
const CUPEuropeShipment = require('../Models/CUPShipmentEurope.model');
const initialUSAShipmentUSD = require('../Models/initialUSDShipmentUSA.model');
const USAShipmentUSD = require('../Models/USDShipmentUSA.model');
const initialEuropeShipmentUSD = require('../Models/initialUSDEuropeShipment.model');
const USDEuropeShipment = require('../Models/USDShipmentEurope.model');
// Adjust path as needed
exports.createSubscription = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1Pecyp09iEbiKxfWsbCw9BOj' }], // Replace with your Price ID
      expand: ['latest_invoice.payment_intent'],
    });

    // Send the subscription object back to the client
    res.status(200).send(subscription);
  } catch (error) {
    // Send error response
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.createSubscriptionNetflix = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1Pecyp09iEbiKxfWsbCw9BOj' }], // Replace with your Price ID
      expand: ['latest_invoice.payment_intent'],
    });

    // Send the subscription object back to the client
    res.status(200).send(subscription);
  } catch (error) {
    // Send error response
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.createPaymentLink = async (req, res) => {
  const { amount, currency, description } = req.body;

  try {
    // Create a Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    // Send the session URL back to the client
    res.status(200).json({ url: session.url });
  } catch (error) {
    // Send error response
    res.status(500).json({ error: error.message });
  }
};


// exports.createInvestmentSubscription = async (req, res) => {
//   const { email, paymentMethodId } = req.body;

//   try {
//     // Create a new customer
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription for the customer
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: 'price_1Pecyp09iEbiKxfWsbCw9BOj' }], // Replace with your Price ID
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Send the subscription object back to the client
//     res.status(200).send(subscription);
//   } catch (error) {
//     // Send error response
//     return res.status(400).send({ error: { message: error.message } });
//   }
// };


//

exports.createInvestmentSubscription = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  if (!email || !paymentMethodId) {
    return res.status(400).send({ error: { message: 'Email and Payment Method ID are required' } });
  }

  try {
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1PjMYI09iEbiKxfWLCRdfrLN' }],
      expand: ['latest_invoice.payment_intent'],
    });

    const investment = new Investment({
      userId: customer.id,
      startDate: new Date(),
      durationDays: 90,
      benefitRange: { min: 5, max: 15 },
      status: 'active',
    });
    await investment.save();

    const applyBenefits = async () => {
      const investmentDetails = await Investment.findOne({ userId: customer.id });

      if (investmentDetails && investmentDetails.durationDays > 0) {
        const benefitPercentage = 10;
        const subscriptionAmount = subscription.items.data[0].price.unit_amount / 100;
        const benefitAmount = subscriptionAmount * (benefitPercentage / 100);

        const mailOptions = {
          from: process.env.HOST_EMAIL,
          to: email,
          subject: 'Investment Benefit Notification',
          html: `<h1>Your Email ${email}</h1>
                 <p>Dear User,<br/><br/>You have earned a benefit of ${benefitPercentage}% amounting to ${benefitAmount}. This amount has been credited to your wallet.<br/><br/>Best regards,<br/>Pitiklini</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
        const ownerMailOptions = {
          from: process.env.HOST_EMAIL,
          to: process.env.HOST_EMAIL,
          subject: 'Investment Benefit Notification',
          html: `<h1>User Email ${email}</h1>
                 <p>Dear Owner,<br/><br/>The user have earned a benefit of ${benefitPercentage}% amounting to ${benefitAmount}. Please send profit to user wallet.<br/><br/>Best regards,<br/>Pitiklini</p>`,
        };
        transporter.sendMail(ownerMailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
        investmentDetails.durationDays -= 30;
        if (investmentDetails.durationDays <= 0) {
          investmentDetails.status = 'completed';
        }
        await investmentDetails.save();
      }
    };

    schedule.scheduleJob(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), applyBenefits);
    schedule.scheduleJob(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), applyBenefits);
    schedule.scheduleJob(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), applyBenefits);

    res.status(200).send(subscription);
  } catch (error) {
    res.status(400).send({ error: { message: error.message } });
  }
};

//MLC

// exports.createMlcSubscription = async (req, res) => {
//   const { email, paymentMethodId } = req.body;

//   try {
//     // Create a new customer
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription for the customer
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: 'price_1Pic6n09iEbiKxfWQgQ7h6V4' }], // Replace with your Price ID
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Send the subscription object back to the client
//     res.status(200).send(subscription);
//   } catch (error) {
//     // Send error response
//     return res.status(400).send({ error: { message: error.message } });
//   }
// };


exports.initialMlcUsaShip = async (req,res)=>{
  const {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode} = req.body;
  try {
    const usaData = {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode};
    const response = await initialUSAShipment.create(usaData);
    return res.status(200).json({message:"Initial USA Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial USA Shipment not created"})
  }
};

exports.MlcUsaShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialUSAShipment.findById(id);
  try {
    const usaData = {
      Name:findData.Name,
      LastName:findData.LastName,
      AccountNumber:findData.AccountNumber,
      RouteNumber:findData.RouteNumber,
      RecipientAddress:findData.RecipientAddress,
      SwiftCode:findData.SwiftCode
    };
    const del = await initialUSAShipment.findByIdAndDelete(id);
    const response = await USAShipment.create(usaData);
    return res.status(200).json({message:"USA Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"USA Shipment not created"})
  }
};

exports.initialMlcEuropeShip = async (req,res)=>{
  const {Country,Name,LastName,IBAN, NameOfTheBank} = req.body;
  try {
    const EuropeData = {Country,Name,LastName,IBAN, NameOfTheBank};
    const response = await initialEuropeShipment.create(EuropeData);
    return res.status(200).json({message:"Initial Europe Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial Europe Shipment not created"})
  }
};

exports.MlcEuropeShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialEuropeShipment.findById(id);
  try {
    const EuropeData = {
      Name:findData.Name,
      LastName:findData.LastName,
      Country:findData.Country,
      IBAN:findData.IBAN,
      NameOfTheBank:findData.NameOfTheBank,
    };
    const del = await initialEuropeShipment.findByIdAndDelete(id);
    const response = await EuropeShipment.create(EuropeData);
    return res.status(200).json({message:"Europe Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"Europe Shipment not created"})
  }
};


// exports.createMlcSubscription = async (req, res) => {
//   const { email, paymentMethodId } = req.body;

//   if (!email || !paymentMethodId) {
//     return res.status(400).send({ error: { message: 'Email and Payment Method ID are required' } });
//   }

//   try {
//     // Create a new customer
//     const customer = await stripe.customers.create({
//       email,
//       payment_method: paymentMethodId,
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // Create a subscription for the customer
//     const subscription = await stripe.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: 'price_1PigNc09iEbiKxfWsMS0lq1R' }], // Replace with your Price ID
//       expand: ['latest_invoice.payment_intent'],
//     });

//     // Send the subscription object back to the client
//     res.status(200).send(subscription);
//   } catch (error) {
//     console.error('Error creating subscription:', error);
//     return res.status(400).send({ error: { message: error.message } });
//   }
// };

//CUP

exports.createMlcSubscription = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  // Check if email and paymentMethodId are provided
  if (!email || !paymentMethodId) {
    return res.status(400).send({ error: { message: 'Email and Payment Method ID are required' } });
  }

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1PifJu09iEbiKxfWKQtg9gRr' }], // Replace with your Price ID
      expand: ['latest_invoice.payment_intent'],
    });

    // Send the subscription object back to the client
    res.status(200).send(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);

    // Check if the error is related to Stripe
    if (error.type) {
      res.status(400).send({ error: { message: `Stripe error: ${error.message}` } });
    } else {
      res.status(500).send({ error: { message: 'Internal server error' } });
    }
  }
};

exports.getMlcSubscriptionUSAShip = async (req, res) => {
  try {
      const getMlcUSAShip = await USAShipment.find({});
      const MlcUSAShip = getMlcUSAShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        AccountNumber:findData.AccountNumber,
        RouteNumber:findData.RouteNumber,
        RecipientAddress:findData.RecipientAddress,
        SwiftCode:findData.SwiftCode
      }))
      res.send( MlcUSAShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.getMlcSubscriptionEuropeShip = async (req, res) => {
  try {
      const getMlcEuropeShip = await EuropeShipment.find({});
      const MlcEuropeShip = getMlcEuropeShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        Country:findData.Country,
        IBAN:findData.IBAN,
        NameOfTheBank:findData.NameOfTheBank
      }))
      res.send( MlcEuropeShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};

//CUP

exports.initialCUPUsaShip = async (req,res)=>{
  const {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode} = req.body;
  try {
    const usaData = {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode};
    const response = await initialUSAShipmentCUP.create(usaData);
    return res.status(200).json({message:"Initial USA Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial USA Shipment not created"})
  }
};

exports.CUPUsaShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialUSAShipmentCUP.findById(id);
  try {
    const usaData = {
      Name:findData.Name,
      LastName:findData.LastName,
      AccountNumber:findData.AccountNumber,
      RouteNumber:findData.RouteNumber,
      RecipientAddress:findData.RecipientAddress,
      SwiftCode:findData.SwiftCode
    };
    const del = await initialUSAShipmentCUP.findByIdAndDelete(id);
    const response = await USAShipmentCUP.create(usaData);
    return res.status(200).json({message:"USA Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"USA Shipment not created"})
  }
};

exports.initialCUPEuropeShip = async (req,res)=>{
  const {Country,Name,LastName,IBAN, NameOfTheBank} = req.body;
  try {
    const EuropeData = {Country,Name,LastName,IBAN, NameOfTheBank};
    const response = await initialEuropeShipmentCUP.create(EuropeData);
    return res.status(200).json({message:"Initial Europe Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial Europe Shipment not created"})
  }
};

exports.CUPEuropeShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialEuropeShipmentCUP.findById(id);
  try {
    const EuropeData = {
      Name:findData.Name,
      LastName:findData.LastName,
      Country:findData.Country,
      IBAN:findData.IBAN,
      NameOfTheBank:findData.NameOfTheBank,
    };
    const del = await initialEuropeShipmentCUP.findByIdAndDelete(id);
    const response = await  CUPEuropeShipment.create(EuropeData);
    return res.status(200).json({message:"Europe Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"Europe Shipment not created"})
  }
};

exports.createCUPSubscription = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  if (!email || !paymentMethodId) {
    return res.status(400).send({ error: { message: 'Email and Payment Method ID are required' } });
  }

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1Pj1oJ09iEbiKxfWxUW8V2up' }], // Replace with your Price ID
      expand: ['latest_invoice.payment_intent'],
    });

    // Send the subscription object back to the client
    res.status(200).send(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.getCUPSubscriptionUSAShip = async (req, res) => {
  try {
      const getCUPUSAShip = await USAShipmentCUP.find({});
      const CUPUSAShip = getCUPUSAShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        AccountNumber:findData.AccountNumber,
        RouteNumber:findData.RouteNumber,
        RecipientAddress:findData.RecipientAddress,
        SwiftCode:findData.SwiftCode
      }))
      res.send( CUPUSAShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.getCUPSubscriptionEuropeShip = async (req, res) => {
  try {
      const getCUPEuropeShip = await CUPEuropeShipment.find({});
      const CUPEuropeShip = getCUPEuropeShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        Country:findData.Country,
        IBAN:findData.IBAN,
        NameOfTheBank:findData.NameOfTheBank
      }))
      res.send( CUPEuropeShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};

//USD


exports.initialUSDUsaShip = async (req,res)=>{
  const {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode} = req.body;
  try {
    const usaData = {Name,LastName,AccountNumber,RouteNumber,RecipientAddress,SwiftCode};
    const response = await initialUSAShipmentUSD.create(usaData);
    return res.status(200).json({message:"Initial USA Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial USA Shipment not created"})
  }
};

exports.USDUsaShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialUSAShipmentUSD.findById(id);
  try {
    const usaData = {
      Name:findData.Name,
      LastName:findData.LastName,
      AccountNumber:findData.AccountNumber,
      RouteNumber:findData.RouteNumber,
      RecipientAddress:findData.RecipientAddress,
      SwiftCode:findData.SwiftCode
    };
    const del = await initialUSAShipmentUSD.findByIdAndDelete(id);
    const response = await USAShipmentUSD.create(usaData);
    return res.status(200).json({message:"USA Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"USA Shipment not created"})
  }
};

exports.initialUSDEuropeShip = async (req,res)=>{
  const {Country,Name,LastName,IBAN, NameOfTheBank} = req.body;
  try {
    const EuropeData = {Country,Name,LastName,IBAN, NameOfTheBank};
    const response = await initialEuropeShipmentUSD.create(EuropeData);
    return res.status(200).json({message:"Initial Europe Shipment created Successfully",response})
  } catch (error) {
    return res.status(200).json({message:"Initial Europe Shipment not created"})
  }
};

exports.USDEuropeShip = async (req,res)=>{
  const {id} = req.params;
  const findData = await initialEuropeShipmentUSD.findById(id);
  try {
    const EuropeData = {
      Name:findData.Name,
      LastName:findData.LastName,
      Country:findData.Country,
      IBAN:findData.IBAN,
      NameOfTheBank:findData.NameOfTheBank,
    };
    const del = await initialEuropeShipmentUSD.findByIdAndDelete(id);
    const response = await USDEuropeShipment.create(EuropeData);
    return res.status(200).json({message:"Europe Shipment created Successfully"})
  } catch (error) {
    return res.status(200).json({message:"Europe Shipment not created"})
  }
};

exports.createUSDSubscription = async (req, res) => {
  const { email, paymentMethodId } = req.body;

  if (!email || !paymentMethodId) {
    return res.status(400).send({ error: { message: 'Email and Payment Method ID are required' } });
  }

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription for the customer
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_1Pj1hf09iEbiKxfWmY1rj103' }], // Replace with your Price ID
      expand: ['latest_invoice.payment_intent'],
    });

    // Send the subscription object back to the client
    res.status(200).send(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(400).send({ error: { message: error.message } });
  }
};


exports.getUSDSubscriptionUSAShip = async (req, res) => {
  try {
      const getUSDUSAShip = await USAShipmentUSD.find({});
      const USDUSAShip = getUSDUSAShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        AccountNumber:findData.AccountNumber,
        RouteNumber:findData.RouteNumber,
        RecipientAddress:findData.RecipientAddress,
        SwiftCode:findData.SwiftCode
      }))
      res.send( USDUSAShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.getUSDSubscriptionEuropeShip = async (req, res) => {
  try {
      const getUSDEuropeShip = await  USDEuropeShipment.find({});
      const USDEuropeShip = getUSDEuropeShip.map((findData) => ({
        Name:findData.Name,
        LastName:findData.LastName,
        Country:findData.Country,
        IBAN:findData.IBAN,
        NameOfTheBank:findData.NameOfTheBank
      }))
      res.send( USDEuropeShip );
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
  }
};