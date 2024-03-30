const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middleware/error');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware'); 

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'config/config.env' });
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(rateLimitMiddleware);

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
app.use('/api', user)
app.use('/api', product)
app.use('/api', order)
app.use('/api', payment)

app.get('/healthCheck', (req, res) => {
    res.send('Server is Running! 🚀');
});

// error handler for rate limit exceeded errors
app.use((err, req, res, next) => {
    if (err instanceof rateLimitMiddleware.RateLimitExceeded) {
        res.status(429).json({ error: 'Rate limit exceeded' });
    } else {
        next(err);
    }
});

app.use(errorMiddleware);

module.exports = app;