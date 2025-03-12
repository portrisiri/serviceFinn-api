const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const errorMiddleWare = require('./middlewares/error');
const notFoundMiddleWare = require('./middlewares/not-found');
const authRoute = require('./routes/auth-route');
const categoryRoute = require('./routes/category-route');
const providerRoute = require('./routes/provider-route');
const addressRoute = require('./routes/address-route');

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/auth', authRoute);
app.use('category', categoryRoute);
app.use('/provider', providerRoute);
app.use('/address', addressRoute);

// Error Handling
app.use(errorMiddleWare);
app.use(notFoundMiddleWare);

// Open Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));
