const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    // file.mimetype == "image/jpg" ||
    // file.mimetype == "image/jpeg" ||
    // file.mimetype == "image/png" ||
    // file.mimetype == "audio/mpeg"
    file
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 10,
  // },
  fileFilter: fileFilter,
});

module.exports = {
  upload,
};
