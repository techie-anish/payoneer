const {mongoose} = require('../config/mongoose');

const userSchema = new mongoose.Schema({
    full_name: {
        type: String, 
        required: true,
    },
    email: {
        type: String, 
        required: true,
    },
    amount: {
        type: Number, 
        required: true,
    },
    note: {
        type: String, 
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User}