const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.cloudinaryUpload = async (req, res, dest) => {
  console.log(`in cloudinary : `);
  let path;
  dest == undefined ? (path = req.file.path) : (path = dest);
  console.log(`path in cloudinary : `, path);

  const uniqueFilename = new Date().toISOString();

  // uploading image to cloudinary.
  const result = cloudinary.uploader.upload(
    path,
    { resource_type: "raw", public_id: `Noyz/${uniqueFilename}`, tags: `Noyz` }, // directory and tags are optional
    (err, file) => {
      if (err) return res.send(err);
      console.log("file uploaded to Cloudinary");

      // remove file from server
      const fs = require("fs");
      fs.unlinkSync(path);
      console.log(`uploaded file removed from the server`);

      // return image details
      return file;
    }
  );
  return (await result).secure_url;
};
