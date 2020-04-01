var aws = require('aws-sdk');
exports.emailService = function(event, context, callback) {
console.log("Hello world from CI/CD");
callback(null,"hello world");
}