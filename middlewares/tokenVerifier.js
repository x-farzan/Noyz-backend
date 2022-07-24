const jwt = require("jsonwebtoken");

exports.tokenVerifier = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.jwtKey, (err, auth) => {
      if (auth) {
        req.userData = auth;
        next();
      } else {
        res.send("Token Expired");
      }
    });
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
      error: error.message,
    });
  }
};
