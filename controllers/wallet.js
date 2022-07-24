const user = require("../models/user");
const { validationResult } = require("express-validator");

exports.addWallets = async (req, res) => {
  try {
    //validate if wallet address is passed?
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    // destructure wallet address
    const { walletAddress } = req.body;

    // find user who wants to add the wallet
    const _userDetails = await user.findOne({
      _id: req.userData._id,
    });
    if (!_userDetails) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    // validate if the wallet address passed is already added or not?
    for (let i in _userDetails.walletAddress) {
      if (_userDetails.walletAddress[i] == walletAddress) {
        return res.json({
          success: false,
          message: "Wallet address is already added.",
          data: walletAddress,
        });
      }
    }

    _userDetails.walletAddress.push(walletAddress);
    await _userDetails.save();

    return res.json({
      success: true,
      message: "Wallet added successfully.",
      data: _userDetails.walletAddress,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.fetchWallets = async (req, res) => {
  try {
    // find user who wants to add the wallet
    const _userDetails = await user.findOne({
      _id: req.userData._id,
    });
    if (!_userDetails) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Wallets fetched successfully.",
      data: _userDetails.walletAddress,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
