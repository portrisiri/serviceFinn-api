const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { clerkMiddleware } = require('@clerk/express');

const errorMiddleWare = require('./middlewares/error');
const notFoundMiddleWare = require('./middlewares/not-found');
const authRoute = require('./routes/auth-route');
const categoryRoute = require('./routes/category-route');
const providerRoute = require('./routes/provider-route');
const addressRoute = require('./routes/address-route');
const documentRoute = require('./routes/document-route');
const serviceRoute = require('./routes/service-route');
const penaltyRoute = require('./routes/penalty-route');
const paymentRoute = require('./routes/payment-route');
const bookingRoute = require('./routes/booking-route');
const reviewRoute = require('./routes/review-route');

const app = express();

app.use(clerkMiddleware());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/auth', authRoute);
app.use('category', categoryRoute);
app.use('/provider', providerRoute);
app.use('/address', addressRoute);
app.use('/document', documentRoute);
app.use('/service', serviceRoute);
app.use('/payment', paymentRoute);
app.use('/penalty', penaltyRoute);

app.use('/booking', bookingRoute);
app.use('/reviews', reviewRoute);
// Error Handling
app.use(errorMiddleWare);
app.use(notFoundMiddleWare);

// Open Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));
