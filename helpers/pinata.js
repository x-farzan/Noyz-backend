const pinataSDK = require("@pinata/sdk");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const pinata = pinataSDK(process.env.pinatakey1, process.env.pinatakey2);

exports.uploadToIPFS = async (file, metadata) => {
  try {
    console.log(`in ipfs`);
    const isAuth = await pinata.testAuthentication();
    console.log(`isAuth : `, isAuth);

    let readableStreamForFile;
    let metaPath;

    if (file == undefined) {
      metaPath = path.join(
        __dirname,
        "../metadata/",
        `${Date.now()}-music-metafile.json`
      );

      fs.writeFileSync(metaPath, JSON.stringify(metadata), function (err) {
        // if (err) throw err;
        console.log("Saved!");
      });
      readableStreamForFile = fs.createReadStream(metaPath);
    } else {
      readableStreamForFile = fs.createReadStream(
        path.join(__dirname, "../", `${file}`)
      );
    }

    const filehash = this.IPFS(readableStreamForFile);
    if (file) {
      fs.unlinkSync(file);
    } else {
      fs.unlinkSync(metaPath);
    }
    return filehash;
    // console.log(`uploadToIPFS `, filehash);
  } catch (error) {}
};

exports.IPFS = async (readableStreamForFile) => {
  try {
    const result = await pinata.pinFileToIPFS(readableStreamForFile);
    console.log(`uploaded successfully...`, result);
    const filehash = `https://gateway.ipfs.io/ipfs/${result.IpfsHash}`;
    console.log(`ipfs hash : `, filehash);

    // if (file) {
    //   fs.unlinkSync(file);
    // } else {
    //   fs.unlinkSync(metaPath);
    // }

    // console.log(`file removed for IPFS`);
    return filehash;
  } catch (err) {}
};
