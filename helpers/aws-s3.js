const AWS = require("aws-sdk");
const fs = require("fs");

const s3 = new AWS.S3({
  accessKeyId: process.env.awsId,
  secretAccessKey: process.env.awsSecretKey,
});

//aws requires string to read for buffering in agrs
exports.awsFileUpload = async (fileName, dest) => {
  let path;
  let file;
  if (dest == undefined) {
    path = fileName;
    file = `${Date.now()}-noyz`;
  } else {
    path = dest;
    file = `${Date.now()}-noyz.mp3`;
  }

  // Read content from the file
  const fileContent = fs.readFileSync(path);

  // Setting up S3 upload parameters
  const params = {
    Bucket: process.env.awsBucketName,
    Key: file, // File name you want to save as in S3
    Body: fileContent,
  };

  // Uploading files to the bucket
  const ddd = await s3.upload(params).promise();
  console.log(ddd);
  fs.unlinkSync(path);
  return ddd.Location;
};
