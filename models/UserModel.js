var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LoginSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, required: true, default: 'newuser' },
    otp: { type: String },
    otpExpiry: { type: Date },  
    image: { type: String },
    roll: { type: String, required: true },
    ip: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", LoginSchema);
