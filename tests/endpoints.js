var chai = require('chai');
var expect = chai.expect;
var request = require('request');

var errorConstants = require('../src/errorConstants');

describe('Authentication tests', function () {
    var local_body;
    it('Valid headers should grant access to the endpoint', function(done) {
        var expectedResult = {"messageCode":"2000","errorMessage":"OK"};
        req = request({
            headers: {
                'public_key': '6FQ2ZCsWBy',
                'timestamp': '1506887184',
                'signature': '232016ab3eec76bb9166b46d39c6c308',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"email":"pericodelospalotes@gmail.com"},
            method: 'POST'
        }, function (err, res, body) {
            local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });
    });
    it('Invalid timestamp should make signature not be the same (deny access)', function(done) {
        var expectedResult = errorConstants.ERROR_INVALID_SIGNATURE;
        req = request({
            headers: {
                'public_key': '6FQ2ZCsWBy',
                'timestamp': '1506887185',
                'signature': '232016ab3eec76bb9166b46d39c6c308',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"email":"pericodelospalotes@gmail.com"},
            method: 'POST'
        }, function (err, res, body) {
            local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });
    });
    it('Invalid signature should (deny access)', function(done) {
        var expectedResult = errorConstants.ERROR_INVALID_SIGNATURE;
        req = request({
            headers: {
                'public_key': '6FQ2ZCsWBy',
                'timestamp': '1506887184',
                'signature': '232016ab3eec76bb9166b46d39c6c307',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"email":"pericodelospalotes@gmail.com"},
            method: 'POST'
        }, function (err, res, body) {
            local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });

    });
    it('Non existing public key should return user not found (deny access)', function(done) {
        var expectedResult = errorConstants.ERROR_USER_NOT_FOUND;
        req = request({
            headers: {
                'public_key': '6FQ2ZCsWBss',
                'timestamp': '1506887184',
                'signature': '232016ab3eec76bb9166b46d39c6c308',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"email":"pericodelospalotes@gmail.com"},
            method: 'POST'
        }, function (err, res, body) {
            local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });

    });



});