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

    authorizeRoles : (...roles) => {
        return (req, res, next) => {
    
            if (!roles.includes(req.user.role)) {
                return next(new syncErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
            }
            next();
        }
    }
    
}