const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
}, {
    timestamps: true
})

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;