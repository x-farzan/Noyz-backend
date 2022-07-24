const mongoose = require("mongoose");
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
require("dotenv").config();
const app = express();
const fs = require("fs");

const port = process.env.port || 5000;

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ------------------------- mongodb connection ------------
  mongoose
    .connect(process.env.mongodb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected with database.");
  })
  .catch((err) => {
    console.log(`Connection failed.`);
  });

// ----------------------  initializing AWS S3 bucket ---------
const s3 = new AWS.S3({
  accessKeyId: process.env.awsId,
  secretAccessKey: process.env.awsSecretKey,
});
const params = {
  Bucket: process.env.awsBucketName,
  CreateBucketConfiguration: {
    // Set your region here
    LocationConstraint: "us-east-2",
  },
};
s3.createBucket(params, function (err, data) {
  if (err) console.log(err, err.stack);
  else console.log("Bucket Created Successfully", data.Location);
});

// ----------------------------- Creating media folders ----------
const uploadFolder = "./uploads";
const metaFolder = "./metadata";

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  console.log(`upload folder created successfully.`);
}
if (!fs.existsSync(metaFolder)) {
  fs.mkdirSync(metaFolder);
  console.log(`metadata folder created successfully.`);
}

// json parser
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Route towards the router file
require("./routes/routes")(app);

// Just to check the response
app.get("/check", (req, res) => {
  return res.json({
    msg: "Ready to roll !!",
  });
});

// server listening on the port
app.listen(port, () => {
  console.log(`Server started at port : ${port}`);
});
