const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, 'Password must be at least 6 characters long.']
    },
    image: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    postalCode: {
        type: String,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    userType: {
        type: String,
        required: true,
        trim: true,
        default: "User"
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      kycDocuments: {
        type: [String],
        required: false,
      },
      balance:{
        type:Number,
        default:0
      },
      currencyCode: { type: String ,default:'USD'},
      referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
