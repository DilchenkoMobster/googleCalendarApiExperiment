var randomstring = require('randomstring');
var md5 = require('md5');

module.exports = {
    generatePublicKey: function(){
        return randomstring.generate({
            length: 10,
            charset: 'alphanumeric'
        });
    },
    generatePrivateKey: function(){
        return randomstring.generate({
            length: 20,
            charset: 'alphanumeric'
        });
    },
    compareSignatures: function(priv_key, pub_key, req, cb){
        var timestamp_to_use = req.headers['timestamp']; // get ts from req header
        var sent_signature = req.headers['signature']; // get signature from req
        var body = JSON.stringify(req.body);
        var generated_signature = md5(priv_key + timestamp_to_use + pub_key + body);
        if(generated_signature === sent_signature){
            cb(null);
        }else{
            cb(new Error("Signatures don't match"));
        }
    }
}