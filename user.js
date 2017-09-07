var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
    auth_code: String,
    access_token: String,
    refresh_token: String,
    token_type: String,
    expiry_date: Number
}));