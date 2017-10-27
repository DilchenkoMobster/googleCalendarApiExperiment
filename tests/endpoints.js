var chai = require('chai');
var expect = chai.expect;
var request = require('request');

var errorConstants = require('../src/errorConstants');

describe('Authentication tests', function () {

    it('Non existing access_token should return user not found (deny access)', function (done) {
        var expectedResult = errorConstants.ERROR_INVALID_TOKEN;
        req = request({
            headers: {
                'access_token': 'lr3NUKfPVtKXOvZJfijwBS7lNmXwMBLzrrNUqtg',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"whateverField": "whatevervalue"},
            method: 'POST'
        }, function (err, res, body) {
            var local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });

    });
    it('Existing access_token should return a valid response', function (done) {
        var expectedResult = {"messageCode": "2000", "errorMessage": "OK"};
        req = request({
            headers: {
                'access_token': 'CRSaLCdidopolag9gIW7PDjLr2FzhU4R34WPJkM6',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: 'http://localhost:3000/protected',
            form: {"whateverField": "whatevervalue"},
            method: 'POST'
        }, function (err, res, body) {
            var local_body = body;
            expect(local_body).to.equal(JSON.stringify(expectedResult));
            done();
        });

    });


});