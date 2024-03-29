const User = require('../models/user');
const asyncErrorHandler = require('../middleware/ErrorHandler');
const pushToken = require('../utils/pushToken');
const SyncErrorHandler = require('../utils/SyncErrorHandler');
// Register User
module.exports = {
    registerUser: asyncErrorHandler(async (req, res, next) => {
        const { name, email, gender, password } = req.body;
        const user = await User.create({ name, email, gender, password });
        pushToken(user, 201, res);
    }),

    loginUser : asyncErrorHandler(async (req, res, next) => {
        const { email, password } = req.body;
        if(!email || !password) {
            return next(new SyncErrorHandler("Please Enter Email And Password", 400));
        }
        const user = await User.findOne({ email}).select("+password");
        if(!user) {
            return next(new SyncErrorHandler("Invalid Email or Password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched) {
            return next(new SyncErrorHandler("Invalid Email or Password", 401));
        }
        pushToken(user, 201, res);
    })
}

