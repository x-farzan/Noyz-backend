const music = require("../models/music");
const user = require("../models/user");
const album = require("../models/album");
var generator = require("generate-password");
require("dotenv").config();
const { passwordStrength } = require("check-password-strength");
const bcrypt = require("bcrypt");
const { sendMail } = require("../helpers/sendGrid");

// var axios = require("axios");

// ----- fetch pending artists, approve and reject them -----

exports.fetchPendingRequests = async (req, res) => {
  try {
    let data = [];

    // fetching pending requests
    const _pendingRequests = await user.find({
      artistStatus: "pending",
      role: "user",
      // samples: { $size: { $gte: 1, $lte: 3 } },
    });
    if (_pendingRequests.length < 1) {
      return res.json({
        success: false,
        message: "No pending requests available yet.",
        data: [],
      });
    }

    // hiding vulnerable data i.e; passwords etc
    _pendingRequests.forEach((elm) => {
      data.push({
        _id: elm._id,
        username: elm.username,
        email: elm.username,
        isEmailVerified: elm.isEmailVerified,
        isGoogleVerified: elm.isGoogleVerified,
        isFacebookVerified: elm.isFacebookVerified,
        genre: elm.genre,
        artistStatus: elm.artistStatus,
        role: elm.role,
        followers: elm.followers,
        followings: elm.followings,
        musicId: elm.musicId,
        albumId: elm.albumId,
        samples: elm.samples,
        walletAddress: elm.walletAddress,
        createdAt: elm.createdAt,
        updatedAt: elm.updatedAt,
      });
    });

    return res.json({
      success: true,
      message: "Pending requests fetched successfully.",
      data: data,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.fetchApproved = async (req, res) => {
  try {
    let data = [];

    const _approvedRequests = await user.find({
      artistStatus: "approved",
      role: "artist",
    });
    if (_approvedRequests.length < 1) {
      return res.json({
        success: false,
        message: "No approved artists available yet.",
        data: [],
      });
    }
    _approvedRequests.forEach((elm) => {
      data.push({
        _id: elm._id,
        username: elm.username,
        email: elm.username,
        isEmailVerified: elm.isEmailVerified,
        isGoogleVerified: elm.isGoogleVerified,
        isFacebookVerified: elm.isFacebookVerified,
        genre: elm.genre,
        artistStatus: elm.artistStatus,
        role: elm.role,
        followers: elm.followers,
        followings: elm.followings,
        musicId: elm.musicId,
        albumId: elm.albumId,
        samples: elm.samples,
        walletAddress: elm.walletAddress,
        createdAt: elm.createdAt,
        updatedAt: elm.updatedAt,
      });
    });

    return res.json({
      success: true,
      message: "Approved requests fetched successfully.",
      data: data,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.fetchRejected = async (req, res) => {
  try {
    let data = [];

    const _rejectedRequests = await user.find({
      artistStatus: "rejected",
      role: "user",
    });
    if (_rejectedRequests.length < 1) {
      return res.json({
        success: false,
        message: "No rejected artists available yet.",
        data: [],
      });
    }
    _rejectedRequests.forEach((elm) => {
      data.push({
        _id: elm._id,
        username: elm.username,
        email: elm.username,
        isEmailVerified: elm.isEmailVerified,
        isGoogleVerified: elm.isGoogleVerified,
        isFacebookVerified: elm.isFacebookVerified,
        genre: elm.genre,
        artistStatus: elm.artistStatus,
        role: elm.role,
        followers: elm.followers,
        followings: elm.followings,
        musicId: elm.musicId,
        albumId: elm.albumId,
        samples: elm.samples,
        walletAddress: elm.walletAddress,
        createdAt: elm.createdAt,
        updatedAt: elm.updatedAt,
      });
    });

    return res.json({
      success: true,
      message: "Rejected requests fetched successfully.",
      data: data,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

// ---- fetch users, active or inactive ----

// fetch all existing users, weather active or not
exports.fetchAllUsers = async (req, res) => {
  try {
    const _usersList = await user
      .find({
        $match: { artistStatus: { $in: ["rejected", "pending"] } },
      })
      .populate({
        path: "financeId",
        model: "Finance",
      })
      .limit(10);
    if (_usersList.length < 1) {
      return res.json({
        success: false,
        message: "No users available to show.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "All users fetched successfully.",
      data: _usersList,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

// fetch al active users
exports.fetchActiveUsers = async (req, res) => {
  try {
    const _usersList = await user.find({
      userStatus: "active",
      $match: { artistStatus: { $in: ["rejected", "pending"] } },
    });
    if (_usersList.length < 1) {
      return res.json({
        success: false,
        message: "No users available to show.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "All users fetched successfully.",
      data: _usersList,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//fetch all inactive users
exports.fetchInactiveUsers = async (req, res) => {
  try {
    const _usersList = await user.find({
      userStatus: "inactive",
      $match: { artistStatus: { $in: ["rejected", "pending"] } },
    });
    if (_usersList.length < 1) {
      return res.json({
        success: false,
        message: "No users available to show.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "All users fetched successfully.",
      data: _usersList,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.makeInactiveOrActive = async (req, res) => {
  try {
    const allowedStatuses = ["active", "inactive"];

    const { userId } = req.params;
    const { status } = req.body;

    const _getUser = await user.findOne({
      _id: userId,
    });
    if (!_getUser) {
      return res.json({
        success: true,
        message: "No user found.",
        data: [],
      });
    }
    // return res.send(_getUser.userStatus);
    if (!allowedStatuses.includes(status)) {
      return res.json({
        success: false,
        message:
          "Status not correct. Allowed statuses are either active or inactive.",
      });
    }
    _getUser.userStatus = status;
    _getUser.save();
    return res.json({
      success: true,
      message: `Status of user : ${_getUser.username} changed successfully to ${status}`,
      data: {
        __id: _getUser._id,
        username: _getUser.username,
        email: _getUser.email,
        userStatus: _getUser.userStatus,
      },
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    let data;

    const _userDetails = await user.findOne({
      _id: userId,
    });
    if (!_userDetails) {
      return res.json({
        success: false,
        message: "User not found",
        data: [],
      });
    }

    if (_userDetails.role == "user") {
      data = {
        _id: _userDetails._id,
        username: _userDetails.username,
        email: _userDetails.email,
        image: _userDetails.image,
        genre: _userDetails.genre,
        socialLinks: _userDetails.socialLinks,
        role: _userDetails.role,
        userStatus: _userDetails.userStatus,
      };
    } else {
      data = {
        _id: _userDetails._id,
        username: _userDetails.username,
        email: _userDetails.email,
        image: _userDetails.image,
        genre: _userDetails.genre,
        socialLinks: _userDetails.socialLinks,
        role: _userDetails.role,
        artistStatus: _userDetails.artistStatus,
      };
    }

    return res.json({
      success: true,
      message: "Details fetched successfully.",
      data: data,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.fetchAllNfts = async (req, res) => {
  try {
    const _allNfts = await music.find().populate({
      path: "albumId",
      model: "Album",
      select: "albumName",
    });
    if (!_allNfts) {
      return res.json({
        success: false,
        message: "No NFT's available to show yet.",
      });
    }
    return res.json({
      success: true,
      message: "All NFT's fetched successfully.",
      dtaa: _allNfts,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    var axios = require("axios");
    let data;
    const { adminUsername, adminEmail, adminPassword } = req.body;
    const password = adminPassword;

    // checking password strength
    if (
      passwordStrength(password).value == "Too weak" ||
      passwordStrength(password).value == "Weak"
    ) {
      return res.json({
        success: false,
        message:
          "8 letter password required, with atleast a symbol, upper and lower case letters and a number.",
        data: [],
      });
    }

    // payload to pass in axios signup api
    config = {
      emailSubject: `Admin Verification NOYZ`,
      emailBody: `Your account is registered on NOYZ as admin, please verify your account by clicking the link below and use the password provided for signin after verification.`,
      username: adminUsername,
      email: adminEmail,
      password: password,
      role: "admin",
    };

    await axios
      .post(`${process.env.aws}/noyz/auth/signup`, config)
      .then((result) => {
        return res.json({
          success: true,
          message: "Admin created successfully.",
          data: {
            username: result.data.data.username,
            email: result.data.data.email,
            image: result.data.data.image,
            isEmailVerified: result.data.data.isEmailVerified,
            userStatus: result.data.data.userStatus,
            role: result.data.data.role,
          },
        });
      })
      .catch((error) => {
        return res.json({
          error: error.message,
        });
      });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { adminUsername, adminPassword } = req.body;
    // return res.send(adminId)

    const _user = await user.findOne({
      _id: adminId,
      role: "admin",
      isEmailVerified: true,
      userStatus: "active",
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "No admin available with this _id.",
        data: [],
      });
    }

    //setting up mail options
    if (adminPassword && !adminUsername) {
      options = {
        emailSubject: `Admin updated NOYZ`,
        emailBody: `Your account is updated by admin, use the password provided below for next signin.`,
        routeString: "",
        username: _user.username,
        email: _user.email,
        password: adminPassword,
      };
      bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (err) {
          return res.json({
            success: false,
            message: err.message,
            data: [],
          });
        }
        _user.password = hash;
      });
    } else if (!adminPassword && adminUsername) {
      options = {
        emailSubject: `Admin updated NOYZ`,
        emailBody: `Your account username is updated by admin, your new username is ${adminUsername}.`,
        routeString: "",
        username: _user.username,
        email: _user.email,
      };
      _user.username = adminUsername;
    } else if (adminPassword && adminUsername) {
      options = {
        emailSubject: `Admin updated NOYZ`,
        emailBody: `Your account is updated by admin, your new username is ${adminUsername} and password is ${adminPassword}`,
        routeString: "",
        username: _user.username,
        email: _user.email,
      };
      _user.username = adminUsername;
      bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (err) {
          return res.json({
            success: false,
            message: err.message,
            data: [],
          });
        }
        _user.password = hash;
      });
    }

    // send Mail
    sendMail(options);

    await _user.save();
    return res.json({
      success: true,
      message: `Admin updated successfully.`,
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
