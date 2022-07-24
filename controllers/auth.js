const { linkGenerator } = require("../helpers/signupConfirmationLinkGenerator");
const { passwordStrength } = require("check-password-strength");
const { validationResult } = require("express-validator");
const { sendMail } = require("../helpers/sendGrid");
const { random } = require("../helpers/randomNumberGenerator");
var generator = require("generate-password");
const validator = require("validator");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const wishlist = require("../models/wishlist");

exports.signupWithGoogle = async (req, res) => {
  try {
    const { googleToken } = req.body;

    //checking if user already exists
    const { email } = googleToken.user;
    const _getUser = await user.findOne({ email: email });
    if (_getUser) {
      return res.json({
        success: true,
        message: "User is already registered with this email.",
        data: [],
      });
    }

    //Generating unique username
    let autoUsername = googleToken.user.email;
    autoUsername = autoUsername.split("@")[0] + random();

    //generating password
    var password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.json({
          success: false,
          messgae: err,
          data: [],
        });
      }

      //object to register
      const userObj = {
        username: autoUsername,
        email: googleToken.user.email,
        password: hash,
        image: googleToken.user.image,
        isEmailVerified: true,
        isGoogleVerified: true,
        role: "user",
      };

      //creating new user
      const _newUser = new user(userObj);
      _newUser.save();
      const {
        username,
        email,
        isEmailVerified,
        isGoogleVerified,
        role,
        genre,
        followers,
        followings,
        musicId,
        albumId,
      } = _newUser;
      return res.json({
        success: true,
        message: "Signed up using Google successfully.",
        data: {
          username: username,
          email: email,
          isEmailVerified: isEmailVerified,
          isGoogleVerified: isGoogleVerified,
          role: role,
          genre: genre,
          followers: followers,
          followings: followings,
          musicId: musicId,
          albumId: albumId,
        },
      });
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signinWithGoogle = async (req, res) => {
  try {
    //extracting token from body
    const { googleToken } = req.body;

    //getting email from googleToken
    const { email } = googleToken.user;

    //search if user available
    const _getUser = await user.findOne({
      email: email,
      isGoogleVerified: true,
    });
    if (!_getUser) {
      return res.json({
        success: true,
        message: "User with this email is not availabe.",
        data: [],
      });
    }

    if (_getUser.userStatus == "inactive") {
      return res.json({
        success: false,
        message:
          "Admin has temporarily blocked you, you cannot login for now. Sorry for inconvenience.",
      });
    }

    //creating token
    const token = jwt.sign(
      {
        _id: _getUser._id,
        username: _getUser.username,
        email: _getUser.email,
        isEmailVerified: _getUser.isEmailVerified,
        isGoogleVerified: _getUser.isGoogleVerified,
        genre: _getUser.genre,
        userStatus: _getUser.userStatus,
      },
      process.env.jwtKey,
      {
        expiresIn: "24h",
      }
    );

    //extracting info from user to display in response
    const {
      username,
      isEmailVerified,
      isGoogleVerified,
      genre,
      followers,
      followings,
      musicId,
      albumId,
    } = _getUser;

    return res.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        username: username,
        email: email,
        isEmailVerified: isEmailVerified,
        isGoogleVerified: isGoogleVerified,
        genre: genre,
        followers: followers,
        followings: followings,
        musicId: musicId,
        albumId: albumId,
      },
      token: token,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signupWithFacebook = async (req, res) => {
  try {
    const { facebookToken } = req.body;
    const { email } = facebookToken;
    console.log(`fb email : `, email);
    const { url } = facebookToken.picture.data;
    console.log(`fb image : `, url);
    const _getUser = await user.findOne({ email: email });
    if (_getUser) {
      return res.json({
        success: false,
        message: "User is already registered with this email.",
        data: [],
      });
    }
    //Generating unique username
    let autoUsername = facebookToken.email;
    autoUsername = autoUsername.split("@")[0] + random();

    //crating a autogenerated pass
    var password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.json({
          success: false,
          messgae: err,
          data: [],
        });
      }

      //object to register
      const userObj = {
        username: autoUsername,
        email: facebookToken.email,
        password: hash,
        image: url,
        isEmailVerified: true,
        isFacebookVerified: true,
        role: "user",
      };

      const _newUser = new user(userObj);
      _newUser.save();
      const {
        username,
        email,
        isEmailVerified,
        isFacebookVerified,
        role,
        genre,
        followers,
        followings,
        musicId,
        albumId,
      } = _newUser;
      return res.json({
        success: true,
        message: "Signed up using Facebook successfully.",
        data: {
          username: username,
          email: email,
          isEmailVerified: isEmailVerified,
          isFacebookVerified: isFacebookVerified,
          role: role,
          genre: genre,
          followers: followers,
          followings: followings,
          musicId: musicId,
          albumId: albumId,
        },
      });
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signinWithFacebook = async (req, res) => {
  try {
    //getting email from googleToken
    const { email } = req.body;

    //search if user available
    const _getUser = await user.findOne({
      email: email,
      isFacebookVerified: true,
    });
    if (!_getUser) {
      return res.json({
        success: true,
        message: "User with this email is not availabe.",
        data: [],
      });
    }

    if (_getUser.userStatus == "inactive") {
      return res.json({
        success: false,
        message:
          "Admin has temporarily blocked you, you cannot login for now. Sorry for inconvenience.",
      });
    }

    //creating token
    const token = jwt.sign(
      {
        _id: _getUser._id,
        username: _getUser.username,
        email: _getUser.email,
        isEmailVerified: _getUser.isEmailVerified,
        isFacebookVerified: _getUser.isFacebookVerified,
        genre: _getUser.genre,
        userStatus: _getUser.userStatus,
        role: _getUser.role,
      },
      process.env.jwtKey,
      {
        expiresIn: "24h",
      }
    );

    //extracting info from user to display in response
    const {
      username,
      isEmailVerified,
      isFacebookVerified,
      role,
      genre,
      followers,
      followings,
      musicId,
      albumId,
    } = _getUser;

    return res.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        username: username,
        email: email,
        isEmailVerified: isEmailVerified,
        isFacebookVerified: isFacebookVerified,
        role: role,
        genre: genre,
        followers: followers,
        followings: followings,
        musicId: musicId,
        albumId: albumId,
      },
      token: token,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    //email contents.
    // const routeString = `
    // https://noyzapp/logins`;
    let options;
    req.body["role"] = req.body.role ? "admin" : "user";
    const emailSubject = `Email Verification NOYZ`;
    const emailBody = `You registered an account on NOYZ, before being able to use your account you need to verify that this is your email address by clicking on following link:`;

    //Validating basic input fields for signup (username, password, email, image link).
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    //Regex for username.
    const passRegExp = new RegExp(
      /^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
    );

    //Password strength validator.
    if (
      passwordStrength(req.body.password).value == "Too weak" ||
      passwordStrength(req.body.password).value == "Weak"
    ) {
      return res.json({
        success: false,
        message:
          "8 letter password required, with atleast a symbol, upper and lower case letters and a number.",
        data: [],
      });
    }

    //Checking username format.
    if (!passRegExp.test(req.body.username)) {
      return res.json({
        success: false,
        message: `Username should be 4-20 characters long, no _ or . at the beginning and ending, no __ or _. or ._ or .. inside.`,
        data: [],
      });
    }

    if (req.body.image == "") {
      delete req.body.image;
    }

    //If all inputs go well, run the signup process.
    if (validator.isEmail(req.body.email)) {
      const _user = await user.find({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      });

      //checking if user exists or not.
      if (_user.length < 1) {
        //if user not found, create a new one.
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
          if (err) {
            return res.json({
              success: false,
              message: err.message,
              data: [],
            });
          }
          const confirmationCode = linkGenerator();
          const newUser = new user({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            image: req.body.image,
            role: req.body.role.includes("admin") ? "admin" : "user",
            emailConfirmationCode: confirmationCode,
          });

          if (req.body.emailSubject) {
            options = {
              email: req.body.email,
              username: req.body.username,
              confirmationCode: confirmationCode,
              routeString: `https://noyzapp/logins/${req.body.email}/${confirmationCode}`,
              emailSubject: req.body.emailSubject,
              emailBody: req.body.emailBody,
              password: req.body.password,
            };
          } else {
            options = {
              email: req.body.email,
              username: req.body.username,
              confirmationCode: confirmationCode,
              routeString: `https://noyzapp/logins/${req.body.email}/${confirmationCode}`,
              emailSubject: emailSubject,
              emailBody: emailBody,
            };
          }

          sendMail(options);

          // creating a wishlist for the same user
          const newWishlist = new wishlist({
            artistId: newUser._id,
          });

          await newUser.save();
          await newWishlist.save();
          return res.json({
            success: true,
            message: "User created successfully.",
            data: newUser,
          });
        });
      } else {
        // return res if user exists.
        return res.json({
          success: false,
          message: "User with this email or username already exists.",
          data: [],
        });
      }
    } else {
      // response if the email is not a valid one.
      return res.json({
        success: false,
        message: "Entered email is not valid.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _user = await user.findOne({
      $or: [{ username: req.body.input }, { email: req.body.input }],
    });
    if (!_user) {
      return res.json({
        success: false,
        message: { passwords: "User with these credentials not exists." },
        data: [],
      });
    }

    //compare passwords adn create a token.
    bcrypt.compare(req.body.password, _user.password, (err, result) => {
      if (result) {
        // check if user is verified or not?
        if (_user.isEmailVerified == false) {
          return res.json({
            success: false,
            message:
              "Please verify the email sent to your provided email first.",
            isEmailVerified: _user.isEmailVerified,
          });
        }

        if (_user.userStatus == "inactive") {
          return res.json({
            success: false,
            message:
              "Admin has temporarily blocked you, you cannot login for now. Sorry for inconvenience.",
          });
        }

        const token = jwt.sign(
          {
            _id: _user._id,
            username: _user.username,
            email: _user.email,
            isEmailVerified: _user.isEmailVerified,
            genre: _user.genre,
            userStatus: _user.userStatus,
            role: _user.role,
          },
          process.env.jwtKey,
          {
            expiresIn: "24h",
          }
        );
        return res.json({
          success: true,
          message: "User logged in successfully.",
          data: { ..._user._doc, token },
        });
      }
      return res.json({
        success: false,
        message: { passwords: "Invalid credentials." },
        data: [],
      });
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.emailVerification = async (req, res) => {
  try {
    const { email, confirmationCode } = req.params;
    const _elm = await user.findOne({
      email: req.params.email,
      isEmailVerified: false,
    });
    if (!_elm) {
      return res.json({
        success: false,
        message: "Email confirmation failed. User not found.",
        data: [],
      });
    }

    if (_elm.emailConfirmationCode === confirmationCode) {
      _elm.isEmailVerified = true;
      await _elm.save();
      return res.json({
        success: true,
        message: "Email verification successfull.",
        data: [],
      });
    } else {
      return res.json({
        success: false,
        message: "Email confirmation failed.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const { oldPassword, newPassword } = req.body;

    const _user = await user.findOne({ _id: req.userData._id });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    bcrypt.compare(oldPassword, _user.password, (err, result) => {
      if (err || result == false) {
        return res.json({
          success: false,
          message: "old password is not correct.",
          data: [],
        });
      }
      if (result) {
        //Password strength validator.
        if (
          passwordStrength(req.body.newPassword).value == "Too weak" ||
          passwordStrength(req.body.newPassword).value == "Weak"
        ) {
          return res.json({
            success: false,
            message:
              "8 letter password required, with atleast a symbol, upper and lower case letters and a number.",
            data: [],
          });
        }
        bcrypt.hash(newPassword, 10, async (err, hash) => {
          if (err) {
            return res.json({
              success: false,
              message: "Password updation failed.",
              data: [],
            });
          }
          _user.password = hash;
          const token = jwt.sign(
            {
              _id: _user._id,
              username: _user.username,
              email: _user.email,
              isEmailVerified: _user.isEmailVerified,
              genre: _user.genre,
              userStatus: _user.userStatus,
              role: _user.role,
            },
            process.env.jwtKey,
            {
              expiresIn: "24h",
            }
          );
          await _user.save();
          return res.json({
            success: true,
            message: "Password updated successfully.",
            data: token,
          });
        });
      }
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    // const routeString = `https://noyzapp/changepasswords`;
    const emailSubject = `Reset Noyz Account Password`;
    const emailBody = `Your password reset request has been generated for your NOYZ account. Please persue by clicking the following link:`;

    const { email } = req.body;
    const _user = await user.findOne({ email: email });
    if (!_user) {
      return res.json({
        success: false,
        message: { email: "Email not found." },
        data: [],
      });
    }
    const createResetToken = jwt.sign(
      {
        id: _user.id,
        email: _user.email,
        username: _user.username,
      },
      process.env.jwtKey,
      {
        expiresIn: "24h",
      }
    );
    _user.passwordResetToken = createResetToken;
    await _user.save();

    options = {
      email: _user.email,
      username: _user.username,
      confirmationCode: _user.passwordResetToken,
      routeString: `https://noyzapp/changepasswords/${_user.email}`,
      emailSubject: emailSubject,
      emailBody: emailBody,
    };

    console.log(`---- before email ----`);

    sendMail(options);

    console.log(`---- after email ----`);

    return res.json({
      success: true,
      message: "Please check provided email to reset Password.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const _user = await user.findOne({
      email: req.params.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not exists.",
        data: [],
      });
    }
    if (_user.passwordResetToken == req.params.resetToken) {
      return res.json({
        success: true,
        message: "You can now update the password.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.resettingPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _user = await user.findOne({
      email: req.params.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    if (req.body.password == req.body.confirmPassword) {
      if (
        passwordStrength(req.body.password).value == "Too weak" ||
        passwordStrength(req.body.password).value == "Weak"
      ) {
        return res.json({
          success: false,
          message:
            "8 letter password required, with atleast a symbol, upper and lower case letters and a number.",
          data: [],
        });
      }
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          return res.json({
            successs: false,
            message: err.message,
            data: [],
          });
        }
        _user.password = hash;
        await _user.save();
        return res.json({
          success: true,
          message: "Password updated successfully.",
          data: _user,
        });
      });
    } else {
      return res.json({
        success: false,
        message: "Password and confirm passwords do not match.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.ifEmailExists = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _email = await user.findOne({ email: req.body.email });
    if (_email) {
      return res.json({
        success: false,
        message: { email: "Entered email is already registered." },
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Email not exists. You can signup with this email.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.ifUsernameExists = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _username = await user.findOne({ username: req.body.username });
    if (_username) {
      return res.json({
        success: false,
        message: { username: "Username already exists." },
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Username not exists, you can signup using this username.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
