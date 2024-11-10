const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    password: {
        type: String
    },
    confirmPassword: {
        type: String
    },
    otp: {
        type: String 
    },
    otpExpiresAt: {
        type: Date
    },
    
    reviews: [{
        type: String
    }]
    
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema);
