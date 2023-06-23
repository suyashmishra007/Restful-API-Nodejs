const mongoose = require('mongoose');
const {
    Schema
} = mongoose;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your email !!"]
    }, // String is shorthand for {type: String}
    email: {
        type: String,
        required: [true, "Please enter your email!!"],
        unique: true,
        // TODO: Validate
    },
    role : {
        type : String,
        enum : {
            values : ['user', 'employeer' ],
            message : 'Please select correct role',
        },
        default : 'user'
    },
    password : {
        type: String,
        required: [true, "Please enter your password!!"],
        min : [8,'Please enter your password min length is 8 characters'],
        select : false
    },
    createdAt : {
        type : Date,
        default :Date.now
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date
});

userSchema.pre('save', async function(next){

    // TODO: Why use this.
    if(!this.isModified('password')) {
        next();
    }
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
})

// NOt static method : Return JSON Web-token
userSchema.methods.getJwtToken = function(){
    const token =  jwt.sign({ id : this._id }, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE_TIME
    });
    return token;
}

// Not static method : Compare hashPassword saved in DB with userEnteredPassword
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}


//  Generate password reset token
userSchema.methods.getResetPasswordToken = async function(){

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // hash reset password token
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Set token expire time.
    this.resetPasswordExpire = Date.now() + 30 * 65 * 1000;
    
    return token;

}

// Create a model
const UserModel = mongoose.model('User', userSchema);

// Export the model
module.exports = UserModel;