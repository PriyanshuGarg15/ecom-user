const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: process.env.LIMIT_TIME_MIN * 60 * 1000, 
    max: process.env.LIMIT_HITS, // Max number of requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    headers: true
});

module.exports = limiter;
