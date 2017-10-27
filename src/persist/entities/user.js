var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({

    email: String,

    // Server
    access_token: String,

    // Google
    g_auth_code: String,
    g_access_token: String,
    g_refresh_token: String,
    g_token_type: String,
    g_expiry_date: Number
}));