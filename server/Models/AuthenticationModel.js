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
    }],

    negativeReviewsLimit:{
        type: Number,
        default: 100
    },
    negativeReviewsCount: {
        type: Number,
        default: 0
    },
    mailSent: {
        type: Boolean,
        default: false
    }
    
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema);
