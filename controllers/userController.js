const crypto = require('crypto');
const User = require('../models/user');
const asyncErrorHandler = require('../middleware/ErrorHandler');
const pushToken = require('../utils/pushToken');
const SyncErrorHandler = require('../utils/SyncErrorHandler');
const sendEmail = require('../utils/sendEmails');
// Register User
module.exports = {
    registerUser: asyncErrorHandler(async (req, res, next) => {
        const { name, email, gender, password } = req.body;
        const user = await User.create({ name, email, gender, password });
        pushToken(user, 201, res);
    }),

    loginUser: asyncErrorHandler(async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new SyncErrorHandler("Please Enter Email And Password", 400));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new SyncErrorHandler("Invalid Email or Password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new SyncErrorHandler("Invalid Email or Password", 401));
        }
        pushToken(user, 201, res);
    }),

    // Logout User
    logoutUser : asyncErrorHandler(async (req, res, next) => {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "Logged Out",
        });
    }),

    getUserDetails : asyncErrorHandler(async (req, res, next) => {
    
        const user = await User.findById(req.user.id);
    
        res.status(200).json({
            success: true,
            user,
        });
    }),

    forgotPassword : asyncErrorHandler(async (req, res, next) => {
    
        const user = await User.findOne({email: req.body.email});
    
        if(!user) {
            return next(new SyncErrorHandler("User Not Found", 404));
        }
    
        const resetToken = await user.getResetPasswordToken();
    
        await user.save({ validateBeforeSave: false });
    
        const resetPasswordUrl = `https://${req.get("host")}/password/reset/${resetToken}`;
        try {
            await sendEmail({
                email: user.email,
                templateId: process.env.SENDGRID_RESET_TEMPLATEID,
                data: {
                    reset_url: resetPasswordUrl
                }
            });
    
            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully`,
            });
    
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
    
            await user.save({ validateBeforeSave: false });
            return next(new SyncErrorHandler(error.message, 500))
        }
    }),
    
    // Reset Password
    resetPassword : asyncErrorHandler(async (req, res, next) => {
    
        // create hash token
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
        const user = await User.findOne({ 
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
    
        if(!user) {
            return next(new SyncErrorHandler("Invalid reset password token", 404));
        }
    
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
    
        await user.save();
        pushToken(user, 200, res);
    }),
    
    // Update Password
    updatePassword : asyncErrorHandler(async (req, res, next) => {
    
        const user = await User.findById(req.user.id).select("+password");
    
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
        if(!isPasswordMatched) {
            return next(new SyncErrorHandler("Old Password is Invalid", 400));
        }
    
        user.password = req.body.newPassword;
        await user.save();
        pushToken(user, 201, res);
    }),
    
    // Update User Profile
    updateProfile : asyncErrorHandler(async (req, res, next) => {
    
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
        }
    
        await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: true,
        });
    
        res.status(200).json({
            success: true,
        });
    }),
    
    // ADMIN DASHBOARD
    
    // Get All Users --ADMIN
    getAllUsers : asyncErrorHandler(async (req, res, next) => {
    
        const users = await User.find();
    
        res.status(200).json({
            success: true,
            users,
        });
    }),
    
    // Get Single User Details --ADMIN
    getSingleUser : asyncErrorHandler(async (req, res, next) => {
    
        const user = await User.findById(req.params.id);
    
        if(!user) {
            return next(new SyncErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
        }
    
        res.status(200).json({
            success: true,
            user,
        });
    }),
    
    // Update User Role --ADMIN
    updateUserRole : asyncErrorHandler(async (req, res, next) => {
    
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            role: req.body.role,
        }
    
        await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    
        res.status(200).json({
            success: true,
        });
    }),
    
    // Delete Role --ADMIN
    deleteUser : asyncErrorHandler(async (req, res, next) => {
    
        const user = await User.findById(req.params.id);
    
        if(!user) {
            return next(new SyncErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
        }
    
        await user.deleteUser();
    
        res.status(200).json({
            success: true
        });
    })
}

