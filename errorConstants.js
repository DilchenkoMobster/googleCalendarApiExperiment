// const metaStrings = {'metaErrorCodeString': 'errorMessage';
// const metaErrorCodeString = 'errorCode';
// TODO make keys of each error a variable (so we don't have to change all strings 1 by 1)

module.exports = Object.freeze({
    ERROR_INVALID_EMAIL_FORMAT: { 'messageCode': "0000001", 'errorMessage': "Invalid email format"},
    ERROR_USER_ALREADY_EXISTS: {'messageCode': "123123", 'errorMessage': "User already exists"},
    ERROR_UNKOWN_ERROR: {'messageCode': "00000", 'errorMessage': "Unkown error ocurred"},
    ERROR_USER_NOT_FOUND: {'messageCode': "11111", 'errorMessage': "User not found"},
    ERROR_INVALID_SIGNATURE: { 'messageCode': "22222", 'errorMessage': "Invalid signature"},
});