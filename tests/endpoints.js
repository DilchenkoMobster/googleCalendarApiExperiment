var chai = require('chai');
var expect = chai.expect;
var request = require('request');

var errorConstants = require('../src/errorConstants');
describe('Endpoints', function () {

    describe('Auth headers', function () {
        var local_body;
        it('Should grant access with valid headers', function (done) {
            var expectedResult = {"messageCode": "2000", "errorMessage": "OK"};
            req = request({
                headers: {
                    'public_key': 'cActBrIXkK',
                    'timestamp': '1506887184',
                    'signature': '9677b50f666b51d40ae8df88cbfccbe7',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'http://localhost:3000/protected',
                form: {"email": "pericodelospalotes@gmail.com"},
                method: 'POST'
            }, function (err, res, body) {
                local_body = body;
                expect(local_body).to.equal(JSON.stringify(expectedResult));
                done();
            });
        });

        // TODO Add timestamp range check??
        it('Should deny access with invalid timestamp (makes signature invalid)', function (done) {
            var expectedResult = errorConstants.ERROR_INVALID_SIGNATURE;
            req = request({
                headers: {
                    'public_key': 'cActBrIXkK',
                    'timestamp': '1506887183',
                    'signature': '2a5be9087589b2409120c46dd23307c4',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'http://localhost:3000/protected',
                form: {"email": "pericodelospalotes@gmail.com"},
                method: 'POST'
            }, function (err, res, body) {
                local_body = body;
                expect(local_body).to.equal(JSON.stringify(expectedResult));
                done();
            });
        });

        it('Should deny access with invalid signature', function (done) {
            var expectedResult = errorConstants.ERROR_INVALID_SIGNATURE;
            req = request({
                headers: {
                    'public_key': 'cActBrIXkK',
                    'timestamp': '1506887184',
                    'signature': '2a5be9087589b2409120c46dd23307c5',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'http://localhost:3000/protected',
                form: {"email": "pericodelospalotes@gmail.com"},
                method: 'POST'
            }, function (err, res, body) {
                local_body = body;
                expect(local_body).to.equal(JSON.stringify(expectedResult));
                done();
            });

        });
        it('Should deny access if public_key doesnt exist', function (done) {
            var expectedResult = errorConstants.ERROR_USER_NOT_FOUND;
            req = request({
                headers: {
                    'public_key': 'cActBrI2XkKs',
                    'timestamp': '1506887184',
                    'signature': '2a5be9087589b2409120c46dd23307c4',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'http://localhost:3000/protected',
                form: {"email": "pericodelospalotes@gmail.com"},
                method: 'POST'
            }, function (err, res, body) {
                local_body = body;
                expect(local_body).to.equal(JSON.stringify(expectedResult));
                done();
            });

        });
    });

    describe('Google calls', function () {
        describe('/generateUrl', function () {

        it('Should return a valid link with valid format', function (done) {
            var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            var expectedResult = true;
            req = request({
                headers: {
                    'public_key': 'cActBrIXkK',
                    'timestamp': '1506887184',
                    'signature': '2a5be9087589b2409120c46dd23307c4',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: 'http://localhost:3000/generateUrl',
                form: {},
                method: 'GET'
            }, function (err, res, body) {
                local_body = JSON.parse(body);
                expect(re.test(local_body.google_auth_url)).to.equal(expectedResult);
                done();
            });

        });
        });
    });

    describe('Email verification', function () {
        describe('/isAdmin', function () {

            it('Should return true whenever an admin email is sent', function(done) {
                var expectedResult = true;
                req = request({
                    headers: {
                        'public_key': 'cActBrIXkK',
                        'timestamp': '1506887184',
                        'signature': '2a5be9087589b2409120c46dd23307c4',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    uri: 'http://localhost:3000/isAdmin?email=aperez@mobiquityinc.com',
                    method: 'GET'
                }, function (err, res, body) {

                    local_body = JSON.parse(body);
                    expect(local_body.isAdmin).to.equal(expectedResult);
                    done();
                });

            });


            it('Should return false whenever an admin email is sent', function(done) {
                var expectedResult = false;
                req = request({
                    headers: {
                        'public_key': 'cActBrIXkK',
                        'timestamp': '1506887184',
                        'signature': '2a5be9087589b2409120c46dd23307c4',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    uri: 'http://localhost:3000/isAdmin?email=invalidemail@mobiquityinc.com',
                    method: 'GET'
                }, function (err, res, body) {
                    local_body = JSON.parse(body);
                    expect(local_body.isAdmin).to.equal(expectedResult);
                    done();
                });

            });

            it('Should return an invalid email error when the format is not correct', function(done) {
                var expectedResult = errorConstants.ERROR_INVALID_EMAIL_FORMAT;
                req = request({
                    headers: {
                        'public_key': 'cActBrIXkK',
                        'timestamp': '1506887184',
                        'signature': '2a5be9087589b2409120c46dd23307c4',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    uri: 'http://localhost:3000/isAdmin?email=invalidemailATmobiquityinc.com',
                    method: 'GET'
                }, function (err, res, body) {
                    local_body = JSON.parse(body);
                    expect(JSON.stringify(local_body)).to.equal(JSON.stringify(expectedResult));
                    done();
                });

            });
        });
    });
});