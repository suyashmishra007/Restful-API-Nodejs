const jwt = require('jsonwebtoken');
const UserModel = require('../models/users');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');

// Check if the user is authenticated or not.
exports.isAuthenticatedUser = catchAsyncError(async function(req,res,next){
    let token = null ;
    const authorizationHeader = req.headers.authorization;
    if(authorizationHeader && authorizationHeader.startsWith('Bearer')){
        token = authorizationHeader.split(' ')[1]; // Extract the token value
    }

    if(token === null){
        return next(new ErrorHandler('Login First',401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded",decoded);

    req.user = await UserModel.findById({_id: decoded.id});
    next();
}) 

// Checks users role
// Check if the user is authenticated or not.
exports.authorizedRole = (...roles) => {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`This role not allowed to access : ${req.user.role}`,403));
        }
        next();
    }
}