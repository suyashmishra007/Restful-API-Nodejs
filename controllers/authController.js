const catchAsyncError = require("../middlewares/catchAsyncError");
const UserModel = require("../models/users");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const authController = {
    // Register a new user => POST: api/v1/register 
    registerUser: catchAsyncError(async (req, res, next) => {
        const {
            name,
            email,
            password,
            role
        } = req.body;
        const newUser = await UserModel.create({
            name,
            email,
            password,
            role
        });

        sendToken(newUser, 200, res);

    }),

    // Login a user => POST: api/v1/login
    loginUser: catchAsyncError(async (req, res, next) => {
        const {
            email,
            password
        } = req.body;

        // Checks if the user or password is entered by the user.
        if (!email || !password) {
            return next(new ErrorHandler("PLease enter email or password", 400));
        }

        const user = await UserModel.findOne({
            email
        }).select('+password');

        if (!user) {
            return next(new ErrorHandler("Invalid email or Password", 400));
        }

        // Check the password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return next(new ErrorHandler("Invalid email or Password", 400));
        }

        sendToken(user, 200, res);
    }),

    // forgot password => api/v1/password/forgot
    forgotPassword: catchAsyncError(async (req, res, next) => {
        const {
            email
        } = req.body;
        const user = await UserModel.findOne({
            email
        });
        if (!user) {
            return next(new ErrorHandler("Invalid email", 400));
        }

        // get resetPassword token
        const resetToken = user.getResetPasswordToken();
        await user.save({
            validateBeforeSave: false
        });

        // Create reset password URL
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste    this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`;
        console.log("78")
        try {
            await sendEmail({
                subject: 'Jobbee-API Password Recovery',
                email,
                message
            });
            clg
            res.status(200).json({
                success: true,
                message: `Email sent successfully to ${user.email}`
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({
                validateBeforeSave: false
            });
            return next(new ErrorHandler('Email is not sent.'), 500);
        }
    }),
    // Reset Password   =>   /api/v1/password/reset/:token
    resetPassword: catchAsyncError(async (req, res, next) => {
        // Hash url token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return next(new ErrorHandler('Password Reset token is invalid or has been expired.', 400));
        }

        // Setup new password
        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user, 200, res);
    }),
    logout: catchAsyncError(async (req, res, next) => {
        res.cookie('token', 'none', {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.'
        });
    })
};



module.exports = authController;