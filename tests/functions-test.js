var chai = require('chai');
var expect = chai.expect;
var endpointApp = require('../src/app.js');
var utilsObject = require('../src/utils/utils.js');
var utilsToken = require('../src/utils/tokenUtils.js');
var request = require('request');

var errorConstants = require('../src/errorConstants');
describe('Local api', function () {
    describe('Email checks', function () {

        describe('isAdmin()', function () {
            it('Should return an invalidFormat error if an invalid email is passed', function () {
                endpointApp.isAdmin('slentsovATmobiquityinc.com', function (object) {
                    var expectedObject = errorConstants.ERROR_INVALID_EMAIL_FORMAT;
                    expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
                })
            });
            it('Should return true if an admin email is passed (slentsov@mobiquityinc.com)', function () {
                endpointApp.isAdmin('slentsov@mobiquityinc.com', function (object) {
                    var expectedObject = {"isAdmin": true};
                    expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
                })
            });
            it('Should return false if a NON-admin email is passed (whatever@mobiquityinc.com)', function () {
                endpointApp.isAdmin('whatever@mobiquityinc.com', function (object) {
                    var expectedObject = {"isAdmin": false};
                    expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
                })
            });
        });

        // TODO add isMobiquityEmail()
        describe('validateEmail()', function () {
            it('Should return true when the email has a valid format (validEmail@valid.domain)', function () {
                var expectedObject = true;
                expect(utilsObject.validateEmail('validEmail@valid.domain')).to.equal(expectedObject);
            });
            it('Should return false when the email has an invalid format (invalidEmailATinvalid.domain)', function () {
                var expectedObject = false;
                expect(utilsObject.validateEmail('invalidEmailATinvalid.domain')).to.equal(expectedObject);
            });

        });

    });
    describe('Token utils', function () {

        describe('generatePrivateKey()', function () {
            it('Should return an alphanumeric string of 20 characters', function () {
                var private_key = utilsToken.generatePrivateKey();
                var re = /[^a-zA-Z0-9]/;
                expect(!re.test(private_key)).to.equal(true);
                expect(private_key.length).to.equal(20);

            });
        });
        describe('generatePublicKey()', function () {

            it('Should return an alphanumeric string of 10 characters', function () {
                var public_key = utilsToken.generatePublicKey();
                var re = /[^a-zA-Z0-9]/;
                expect(!re.test(public_key)).to.equal(true);
                expect(public_key.length).to.equal(10);

            });
        });
        describe('compareSignatures()', function () {

            it('Should  allow correct signatures', function () {

                var priv_key = 'xNuAdbvZO8h6au4BihQg';
                var pub_key = '6FQ2ZCsWBy';
                var body = {"email": "pericodelospalotes@gmail.com"}

                // Need to create request, will not be sent anywhere but the callback needs to exist
                req = request({
                    headers: {
                        'Content-Type': 'application/json',
                        'timestamp': 1506887184,
                        'signature': '232016ab3eec76bb9166b46d39c6c308'
                    },
                    uri: 'http://myUrl',
                    body: body,
                    method: 'POST'
                }, function (err, res, body) {
                    // Error is raised here (because no uri to call and no body). Doesn't matter, we want it to remain local
                });

                utilsToken.compareSignatures(priv_key, pub_key, req, function (err) {
                    if (err == null) {
                        expect(true).to.equal(true);
                    } else {
                        expect(false).to.equal(true);
                    }
                });
            });
            it('Should NOT allow incorrect signatures', function () {

                var priv_key = '0Foqa4ERmBrLfBlprGvm';
                var pub_key = 'RIycWQFnEX';

                // Need to create request, will not be sent anywhere but the callback needs to exist
                req = request({
                    headers: {
                        'Content-Type': 'application/json',
                        'timestamp': 1506879154,
                        'signature': 'dbbec60952c6e19a56a227f99ec989f4INCORRECT'
                    },
                    uri: 'http://myUrl',
                    body: {},
                    method: 'POST'
                }, function (err, res, body) {
                    // Error is raised here (because no uri to call and no body). Doesn't matter, we want it to remain local
                });

                utilsToken.compareSignatures(priv_key, pub_key, req, function (err) {
                    if (err == null) {
                        expect(false).to.equal(true);
                    } else {
                        expect(true).to.equal(true);
                    }
                });


            });
        });
    });
});