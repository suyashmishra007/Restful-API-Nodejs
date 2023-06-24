const catchAsyncError = require("../middlewares/catchAsyncError");
const JobModel = require("../models/jobs");
const ErrorHandler = require("../utils/errorHandler");
const UserModel = require("../models/users");
const sendToken = require("../utils/jwtToken");


const userController = {
    getUserProfile: catchAsyncError(async (req, res, next) => {
        const {
            _id
        } = req.user._id;
        const user = await UserModel.findById({
            _id
        });

        res.status(200).json({
            success: true,
            data: user
        })
    }),
    updateCurrentUserPassword: catchAsyncError(async (req, res, next) => {

        const {
            _id
        } = req.user._id;
        const user = await UserModel.findById({
            _id
        }).select("+password");

        const {
            currentPassword,
            newPassword
        } = req.body;
        const isMatched = await user.comparePassword(currentPassword);

        if (!isMatched) {
            return next(new ErrorHandler("Current password is incorrect", 401));
        }

        user.password = newPassword;
        await user.save();

        sendToken(user, 200, res);
    }),
    updateUserData: catchAsyncError(async (req, res, next) => {
        const {
            email,
            name
        } = req.body;
      
        const {
            _id
        } = req.user._id;

        const user = await UserModel.findByIdAndUpdate(_id, {
            email,
            name
        }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        })
    }),
    deleteUser : catchAsyncError(async (req,res,next)=>{
        const {
            _id
        } = req.user._id;

        const user = await UserModel.findByIdAndDelete(_id);
        res.cookie('token','none',{
            expires: new Date(Date.now()),
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            data: user
        })

    })
}

module.exports = userController;