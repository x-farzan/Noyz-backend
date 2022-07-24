const path = require("path");
require("dotenv").config();
const fs = require("fs");

exports.fileAppender = (path, metadata) => {
  try {
    fs.appendFileSync(
      path,
      JSON.stringify(metadata)
    );
  } catch (error) {}
};
