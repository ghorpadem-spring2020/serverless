const aws = require("aws-sdk");
aws.config.update({ region: "us-east-1" });
exports.emailService = function(event, context, callback) {
  let message = event.Records[0].Sns.Message;
  let messagejson = JSON.parse(message);
  console.log("Test Message email id: " + messageJson.user_email);
  console.log("Test Message email: " + messageJson);
  var emailParams = {
    Destination: {
      ToAddresses: [
        messagejson.user_email
      ]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: "mrunal.ghorpade.me/v1/bill"+messagejson.id
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Bills due"
      }
    },
    Source: "csye6225@"+process.env.DOMAIN_NAME
  };

  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(emailParams).promise();
  sendPromise.then(
    function(data) {
      console.log("Email sent"+data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
};