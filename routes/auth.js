const { tokenVerifier } = require("../middlewares/tokenVerifier");
const { uploadProfilePicture } = require("../controllers/user");
const { emailVerification } = require("../controllers/auth");
const { uploadMusic } = require("../controllers/music");
const { upload } = require("../middlewares/multer");
const { check } = require("express-validator");
const authController = require("../controllers/auth");
const express = require("express");
const router = express.Router();

// ------------------------------------------  Authentication routes...
router.post("/google/signup", authController.signupWithGoogle);

router.post("/google/signin", authController.signinWithGoogle);

router.post("/facebook/signup", authController.signupWithFacebook);

router.post("/facebook/signin", authController.signinWithFacebook);

router.post(
  "/signup",
  [
    check("username").notEmpty().withMessage("Username is required."),
    check("email").notEmpty().withMessage("Email is required."),
    check("password").notEmpty().withMessage("Password is required."),
  ],
  authController.signup
);
router.post(
  "/signin",
  [
    check("input").notEmpty().withMessage("Username or Email is required."),
    check("password").notEmpty().withMessage("Password is required."),
  ],
  authController.signin
);
router.get(
  "/confirm/:email/:confirmationCode",
  authController.emailVerification
);
router.post(
  "/change/password",
  [
    check("oldPassword").notEmpty().withMessage("oldPassword is required"),
    check("newPassword").notEmpty().withMessage("newPassword is required"),
  ],
  tokenVerifier,
  authController.changePassword
);
router.post(
  "/forget/password",
  [check("email").notEmpty().withMessage("email is required")],
  authController.forgetPassword
);
router.get(
  "/confirm/reset/password/:email/:resetToken",
  authController.resetPassword
);
router.post(
  "/resetting/password/:email",
  [check("password").notEmpty().withMessage("password is required")],
  authController.resettingPassword
);
router.post(
  "/check/email",
  [check("email").notEmpty().withMessage("email is required")],
  authController.ifEmailExists
);
router.post(
  "/check/username",
  [check("username").notEmpty().withMessage("username is required")],
  authController.ifUsernameExists
);

module.exports = router;
