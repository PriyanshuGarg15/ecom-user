const User = require('../models/user');
const asyncErrorHandler = require('../middleware/ErrorHandler');
const pushToken = require('../utils/pushToken');
// Register User
module.exports = {
    registerUser: asyncErrorHandler(async (req, res, next) => {
        const { name, email, gender, password } = req.body;
        const user = await User.create({ name, email, gender, password });
        pushToken(user, 201, res);
    })
}

