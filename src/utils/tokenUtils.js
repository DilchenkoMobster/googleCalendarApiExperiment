var randomstring = require('randomstring');

module.exports = {
    generateAccessToken: function () {
        return randomstring.generate({
            length: 40,
            charset: 'alphanumeric'
        });
    }
}