const album = require("../models/album");
const music = require("../models/music");
const user = require("../models/user");
const wishlist = require("../models/wishlist");

exports.addToWishlist = async (req, res) => {
  try {
    let wishlistObj = {};
    const { id } = req.params; // id - nft id to be added in wishlist
    const artistId = req.userData._id; // artistId - user's id whose wishlist has to br created.

    const _user = await user.findOne({
      _id: artistId,
    });
    const _isMusic = await music.findOne({
      _id: id,
    });
    const _isAlbum = await album.findOne({
      _id: id,
    });
    let _wish = await wishlist.findOne({
      artistId: artistId,
    });

    // ---- if wishlist not exists ----
    if (!_wish) {
      _wish = await wishlist.create({
        artistId: artistId,
      });
    }

    // ----- if wishlist already created and has items in it ----
    if (_wish && _wish.wishlist.length > 0) {
      _wish.wishlist.filter((elm) => {
        if (elm == id)
          return res.json({
            success: false,
            message: "Item already added in wishlist",
            data: [],
          });
      });
    }
    // return res.send(`works fine till now`);

    if (_isMusic) {
      console.log(`_isMusic : `, _isMusic);
      wishlistObj = {
        artistId: artistId,
        wishlist: id,
        onModel: "Music",
      };
    } else if (_isAlbum) {
      console.log(`_isAlbum : `, _isAlbum);
      wishlistObj = {
        artistId: artistId,
        wishlist: id,
        onModel: "Album",
      };
    }

    console.log(`wishlistObj.wishlist : `, wishlistObj.wishlist);
    console.log(`_wish : `, _wish);

    // return res.send(`works fine till now`);
    _wish.wishlist.push(wishlistObj.wishlist);
    if (
      _wish.onModel.length < 2 &&
      !_wish.onModel.includes(wishlistObj.onModel)
    )
      _wish.onModel.push(wishlistObj.onModel);

    // --- saving wislist id in user ----
    if (_user.wishlistId.length > 0) {
      for (let i = 0; i < _user.wishlistId.length; i++) {
        if (_user.wishlistId.includes(_wish._id)) {
        } else {
          _user.wishlistId.push({ _id: _wish._id });
        }
      }
    } else {
      _user.wishlistId.push({ _id: _wish._id });
    }
    await _wish.save();
    await _user.save();
    return res.json({
      success: true,
      message: "Item added to the wishlist successfully.",
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getFromWishlist = async (req, res) => {
  try {
    const { _id } = req.userData;
    const _getWishlist = await wishlist
      .findOne({
        artistId: _id,
      })
      .populate({
        path: "wishlist",
        populate: {
          path: "artistId",
          model: "User",
          select: "username",
        },
      });
    if (!_getWishlist) {
      return res.json({
        success: false,
        message: "No wishlist created yet.",
        data: [],
      });
    }
    return res.send(_getWishlist);
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { nftId } = req.params;
    const userId = req.userData._id;

    const _wishlist = await wishlist.findOne({
      artistId: userId,
    });
    if (_wishlist.wishlist.includes(nftId)) {
      _wishlist.wishlist.pull(nftId);
    } else {
      return res.json({
        success: true,
        message: "Item is not available in wishlist yet.",
        data: [],
      });
    }
    await _wishlist.save();
    return res.json({
      success: true,
      message: "Item removed from wishlist successfully.",
      data: _wishlist.wishlist,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

// api to get which items are added in wishlist by logged in user.
// to manage hearts state in app
exports.getAdded = async (req, res) => {
  try {
    const userId = req.userData._id;
    const _userDetails = await user
      .findOne({
        _id: userId,
      })
      .populate({
        path: "wishlistId",
        model: "Wishlist",
      });
    if (!_userDetails) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    // return res.send(_userDetails);
    if (_userDetails.wishlistId.length > 0) {
      return res.json({
        success: true,
        message: "NFT's added in wishlist fetched.",
        data: _userDetails.wishlistId[0].wishlist,
      });
    } else {
      return res.json({
        success: true,
        message: "No NFT's available in wishlist yet.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
