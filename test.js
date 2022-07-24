// const AWS = require("aws-sdk");
// require("dotenv").config();

// const s3 = new AWS.S3({
//   accessKeyId: process.env.awsId,
//   secretAccessKey: process.env.awsSecretKey,
// });
// const params = {
//   Bucket: process.env.awsBucketName,
//   CreateBucketConfiguration: {
//     // Set your region here
//     LocationConstraint: "us-east-2",
//   },
// };
// s3.createBucket(params, function (err, data) {
//   if (err) console.log(err, err.stack);
//   else console.log("Bucket Created Successfully", data.Location);
// });

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
console.log(millisToMinutesAndSeconds(240000));
