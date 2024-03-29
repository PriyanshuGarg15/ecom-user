const jwt = require('jsonwebtoken');
const User = require('../models/user');
const syncErrorHandler = require('../utils/SyncErrorHandler');
const asyncErrorHandler = require('./ErrorHandler');

module.exports = {
    isAuthenticatedUser: asyncErrorHandler(async (req, res, next) => {
        const { token } = req.cookies;
        if (!token) {
            return next(new syncErrorHandler("Please Login to Access", 401))
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        next();
    }),
}