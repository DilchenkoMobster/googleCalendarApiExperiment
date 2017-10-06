var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({

    email: {type: String, index: {unique: true}},

    // Server
    public_key: String,
    private_key: String,

    // Google
    g_access_token: String,
    g_refresh_token: String,
    g_token_type: String,
    g_expiry_date: Number
}));