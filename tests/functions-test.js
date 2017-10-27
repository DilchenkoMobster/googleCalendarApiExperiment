var chai = require('chai');
var expect = chai.expect;
var endpointApp = require('../src/app.js');
var utilsObject = require('../src/utils/utils.js');
var utilsToken = require('../src/utils/tokenUtils.js');
var request = require('request');

var errorConstants = require('../src/errorConstants');

describe('isAdmin', function () {
    it('/isAdmin should return an invalidFormat error if an invalid email is passed', function () {
        endpointApp.isAdmin('slentsovATmobiquityinc.com', function (object) {
            var expectedObject = errorConstants.ERROR_INVALID_EMAIL_FORMAT;
            expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
        })
    });
    it('/isAdmin should return true if an admin email is passed (slentsov@mobiquityinc.com)', function () {
        endpointApp.isAdmin('slentsov@mobiquityinc.com', function (object) {
            var expectedObject = {"isAdmin": true};
            expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
        })
    });
    it('/isAdmin should return false if a NON-admin email is passed (whatever@mobiquityinc.com)', function () {
        endpointApp.isAdmin('whatever@mobiquityinc.com', function (object) {
            var expectedObject = {"isAdmin": false};
            expect(JSON.stringify(object)).to.equal(JSON.stringify(expectedObject));
        })
    });
});

describe('utils', function () {
    it('validateEmail() should return true when the email has a valid format (validEmail@valid.domain)', function () {
        var expectedObject = true;
        expect(utilsObject.validateEmail('validEmail@valid.domain')).to.equal(expectedObject);
    });
    it('validateEmail() should return false when the email has an invalid format (invalidEmailATinvalid.domain)', function () {
        var expectedObject = false;
        expect(utilsObject.validateEmail('invalidEmailATinvalid.domain')).to.equal(expectedObject);
    });
    it('isValidEmail() should return true when the email is from mobiquity (someEmail@mobiquityinc.com)', function () {
        var expectedObject = true;
        expect(utilsObject.isValidEmail('someEmail@mobiquityinc.com')).to.equal(expectedObject);
    });
    it('isValidEmail() should return false when the email is not form mobiquity (someEmail@gmail.com)', function () {
        var expectedObject = false;
        expect(utilsObject.isValidEmail('someEmail@gmail.com')).to.equal(expectedObject);
    });
});

describe('tokenUtils', function () {
    it('generateAccessToken() should return an alphanumeric string of 40 characters', function () {
        var private_key = utilsToken.generateAccessToken();
        var re = /[^a-zA-Z0-9]/;
        expect(!re.test(private_key)).to.equal(true);
        expect(private_key.length).to.equal(40);

    });

});