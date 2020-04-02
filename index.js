const aws = require("aws-sdk");
var ddb = new aws.DynamoDB({ apiVersion: "2012-08-10" });
aws.config.update({ region: "us-east-1" });
exports.emailService = function (event, context, callback) {
  let message = event.Records[0].Sns.Message;
  let messageJson = JSON.parse(message);
  let messageDataJson = JSON.parse(messageJson.Body);
  console.log("message data json Body" + messageDataJson);
  console.log("JOSN message " + messageJson);
  console.log("Test Message email id: " + messageJson.Body);
  console.log("Test email " + messageDataJson[0].user_email);
  var dataObj = [];
  for (var i in messageDataJson) {
    dataObj[i] = "mrunalghorpade.me/v1/bill/" + messageDataJson[i].id;
  }
  let ttl = 1 * 60 * 60 * 1000;
  let currentTime = new Date().getTime();
  let expirationTime = (currentTime + ttl).toString();
  let emailMessage = dataObj.toString();
  var emailParams = {
    Destination: {
      ToAddresses: [
        messageDataJson[0].user_email
      ]
    },
    Message: {
      Body: {

        Text: {
          Charset: "UTF-8",
          Data: emailMessage
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Bills due"
      }
    },
    Source: "csye6225@" + process.env.DOMAIN_NAME
  };

  let putParams = {
    TableName: "csye6225",
    Item: {
      email_id: { S: messageDataJson[0].user_email },
      ttl: { N: expirationTime }
    }
  };
  let queryParams = {
    TableName: 'csye6225',
    Key: {
      'email_id': { S: messageDataJson[0].user_email }
    },
  }

  ddb.getItem(queryParams, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      console.log("Data from dynamo db " + data);
      if (data.Item == null) {
        ddb.putItem(putParams, function (error, result) {
          if (error) {
            console.log("Error in putting data " + error)
          }
          else {
            console.log("data added to dynamo db table " + result)
            var sendPromise = new aws.SES({ apiVersion: '2010-12-01' }).sendEmail(emailParams).promise();
            sendPromise.then(
              function (data) {
                console.log("Email sent" + data.MessageId);
              }).catch(
                function (err) {
                  console.error(err, err.stack);
                });
          }
        })
      }
      else {
        console.log("Email ID exists");
      }
    }
  })
};
