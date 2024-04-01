const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middleware/error');
const cors = require("cors");
const app = express();
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'config/config.env' });
}
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');

app.use(
    cors(
        // {
        //     origin: [/localhost:3008$/, /\.heroku\.com$/],
        //     methods: ["GET", "POST"],
        //     optionsSuccessStatus: 200,
        // }
    )
);
app.use(rateLimitMiddleware);
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

app.get('/healthCheck', (req, res) => {
    res.send('Server is Running! 🚀');
});

// error handler for rate limit exceeded errors
app.use((err, req, res, next) => {
    if (err && err.message === 'Too many requests from this IP, please try again later') {
        res.status(429).json({ error: 'Rate limit exceeded' });
    } else {
        next(err);
    }
})

app.use(errorMiddleware);

module.exports = app;