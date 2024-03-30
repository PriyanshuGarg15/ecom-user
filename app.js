const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middleware/error');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'config/config.env' });
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
app.use('/api', user)
app.use('/api', product)
app.use('/api', order)
app.use('/api', payment)

app.get('/', (req, res) => {
    res.send('Server is Running! 🚀');
});
app.use(errorMiddleware);

module.exports = app;