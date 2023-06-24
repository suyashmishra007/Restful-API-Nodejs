const catchAsyncError = require("../middlewares/catchAsyncError");
const JobModel = require("../models/jobs");
const ErrorHandler = require("../utils/errorHandler");
const UserModel = require("../models/users");
const sendToken = require("../utils/jwtToken");
const APIFilters = require('../utils/apiFilters');


const deleteUserData_Helper = async (user,role) => {
    if(role === 'employeer'){
        await JobModel.deleteMany({user});
    }
    if(role === 'user'){
        const appliedJobs = await JobModel.find({'applicantsApplied.id' : user}).select('+applicantsApplied');

    for(let i=0; i<appliedJobs.length; i++) {
        let obj = appliedJobs[i].applicantsApplied.find(o => o.id === user);

        let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace('\\controllers', '');

        fs.unlink(filepath, err => {
            if(err) return console.log(err);
        });

        appliedJobs[i].applicantsApplied.splice(appliedJobs[i].applicantsApplied.indexOf(obj.id));

        await appliedJobs[i].save();
    }
    }
}

const userController = {
    getUserProfile: catchAsyncError(async (req, res, next) => {
        const {
            _id
        } = req.user._id;
        const user = await UserModel.findById({
            _id
        }).populate({
            path : 'jobsPublished',
            select : 'title postingDate'
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
            _id , role
        } = req.user;


        deleteUserData_Helper(_id,role);

        const user = await UserModel.findByIdAndDelete(_id);
        res.cookie('token','none',{
            expires: new Date(Date.now()),
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            data: user
        })

    }),
    // Show all the applied jobs , => api/v1/jobs/applied
    getAppliedJobs: catchAsyncError(async (req, res, next) => {

        const {
            _id : userId
        } = req.user;

        const jobs = await JobModel.find({'applicantsApplied.id' : userId}).select('+applicantsApplied');

        res.status(200).json({
            success : true,
            results : jobs.length,
            data : jobs
        })

    }),
    // Show all the published jobs by the 'employeer' , api/v1/jobs/published
    getPublishedJobs: catchAsyncError(async (req, res, next) => {

        const {
            _id : userId
        } = req.user;

        const jobs = await JobModel.find({user : userId}).select('+applicantsApplied');

        res.status(200).json({
            success : true,
            results : jobs.length,
            data : jobs 
        });

    }), 

    // Show all users . => api/v1/users
    getUsers: catchAsyncError(async (req, res, next) => {
        const apiFilters = new APIFilters(UserModel.find(),req.query).filter().sort().limitFields().pagination();

        const users = await apiFilters.query;

        res.status(200).json({
            success : true,
            results : users.length,
            data : users
        })
    }),

    // Delete user(admin) => api/v1/user/:_id
    deleteUserByAdmin: catchAsyncError(async (req, res, next) => {
        const {
            _id: userId , role
        } = req.params;

        const user = await UserModel.findById({_id : userId});
        if(!user){
            return next(new ErrorHandler(`User not found with id : ${userId}`,404));
        }

        deleteUserData_Helper(userId,role);
        user.remove();


        res.status(200).json({
            success : true,
            message : `User is successfully deleted by Admin.`,
            data : user
        });
    })
}

module.exports = userController;