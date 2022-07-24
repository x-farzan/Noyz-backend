const { cloudinaryUpload } = require("../helpers/cloudinaryUpload");
const { validationResult } = require("express-validator");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { awsFileUpload } = require("../helpers/aws-s3");
const music = require("../models/music");
const album = require("../models/album");
const cart = require("../models/cart");
const finance = require("../models/finance");
const { response } = require("express");
const e = require("express");
const axios = require("axios").default;

exports.uploadPicture = async (req, res) => {
  try {
    const fileSize = 10000000;
    const mimeTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (!req.file) {
      return res.json({
        success: false,
        message: "File not uploaded.",
      });
    }
    if (req.file && req.file.size > fileSize) {
      return res.json({
        success: false,
        message:
          "Required file size to be uploaded is less than or equals to 10 MB",
      });
    }
    if (!(req.file && mimeTypes.includes(req.file.mimetype))) {
      return res.json({
        success: false,
        message: "Format is not correct. Allowed formats are jpg, jpeg, png.",
      });
    }

    const image = await awsFileUpload(req.file.path, (dest = undefined));
    return res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.editProfile = async (req, res) => {
  try {
    let obj = { ...req.body }; // getting a copy of body...

    // modifying my object....
    if (obj.image == "") {
      delete obj.image;
    }
    if (!obj.genre) {
      delete obj.genre;
    }
    // if (obj.bio == "") {
    //   delete obj.bio;
    // }

    // if everything goes well, check for the genre length, atleat 3...
    if (obj.genre.length < 3) {
      return res.json({
        success: false,
        message: "Please select a minimum of 3 genre.",
        data: [],
      });
    }

    // finding respective user...
    const _user = await user.findOne({ email: req.userData.email });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not exists.",
        data: [],
      });
    }

    // getting those keys and values from "obj" that are present and saving only those values in the user...
    for (let i = 0; i < Object.keys(obj).length; i++) {
      _user[Object.keys(obj)[i]] = Object.values(obj)[i];
    }
    await _user.save();
    return res.json({
      success: true,
      message: "Profile information updated successfully.",
      data: _user,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const _user = await user.findOne({
      email: req.userData.email,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "User details fetched.",
      data: _user,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.followArtist = async (req, res) => {
  try {
    // return res.send(req.params.artistId);
    const userId = req.userData._id;
    const _userToFollow = await user.findOne({
      _id: req.params.artistId,
      role: "artist",
      isEmailVerified: true,
      // userStatus: "active",
    });
    if (!_userToFollow) {
      return res.json({
        success: false,
        message: "You are trying to follow an invalid artist.",
        data: [],
      });
    }
    const _userWhoFollows = await user.findOne({
      _id: userId,
      isEmailVerified: true,
    });
    // return res.send({ _id: req.userData._id });
    if (!_userWhoFollows) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    for (let i = 0; i < _userToFollow.followers.length; i++) {
      if (_userToFollow.followers[i] == req.userData._id) {
        return res.json({
          success: false,
          message: "You have already followed this artist.",
          data: [],
        });
      }
    }

    console.log(_userToFollow);
    console.log(_userWhoFollows);

    _userToFollow.followers.push(_userWhoFollows._id);
    _userWhoFollows.followings.push(_userToFollow._id);
    await _userToFollow.save();
    await _userWhoFollows.save();
    return res.json({
      success: true,
      message: `You followed ${_userToFollow.username} successfully.`,
      data: [],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.unfollowArtist = async (req, res) => {
  try {
    let flag;
    const _userToUnfollow = await user.findOne({
      _id: req.params.artistId,
      role: "artist",
      isEmailVerified: true,
      // userStatus: "active",
    });
    if (!_userToUnfollow) {
      return res.json({
        success: false,
        message: "You are trying to follow an invalid artist.",
        data: [],
      });
    }

    const _userWhoUnfollows = await user.findOne({
      _id: req.userData._id,
      isEmailVerified: true,
    });
    if (!_userWhoUnfollows) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    if (_userToUnfollow.followers.length == 0) {
      return res.json({
        success: false,
        message: "You haven't followed this artist yet.",
        data: [],
      });
    }

    for (let i = 0; i < _userToUnfollow.followers.length; i++) {
      console.log(`in loopeeeeeee`);
      if (_userToUnfollow.followers[i] == req.userData._id) {
        flag = true;
        break;
      } else {
        flag = false;
      }
    }

    if (flag) {
      _userToUnfollow.followers.pull(_userWhoUnfollows._id);
      _userWhoUnfollows.followings.pull(_userToUnfollow._id);

      await _userToUnfollow.save();
      await _userWhoUnfollows.save();
      return res.json({
        success: true,
        message: `You unfollowed ${_userToUnfollow.username} successfully.`,
        data: [],
      });
    } else {
      return res.json({
        success: false,
        message: `You haven't followed ${_userToUnfollow.username}.`,
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.artistFollowersList = async (req, res) => {
  try {
    const _user = await user
      .findOne({
        _id: req.userData._id,
        isEmailVerified: true,
        // role: "artist",
      })
      .populate({ path: "followers", model: "User" });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    // if currently artist have 0 followers
    if (_user.followers.length == 0) {
      return res.json({
        success: true,
        message: "Currently no followers.",
        data: [],
      });
    }

    return res.json({
      success: true,
      data: _user.followers,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.artistFollowingList = async (req, res) => {
  try {
    const _user = await user
      .findOne({
        _id: req.userData._id,
        isEmailVerified: true,
        // role: "artist",
      })
      .populate({ path: "followings", model: "User" });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    // if currently artist have 0 following
    if (_user.followings.length == 0) {
      return res.json({
        success: true,
        message: "Currently no followings.",
        data: [],
      });
    }

    return res.json({
      success: true,
      data: _user.followings,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.connectWallet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const _user = await user.findOne({
      _id: req.userData._id,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    _user.walletAddress = req.body.walletAddress;
    await _user.save();
    return res.json({
      success: true,
      message: `Wallet address : ${req.body.walletAddress} added successfully.`,
      data: req.body.walletAddress,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.addGenre = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    if (req.body.genre.length < 3) {
      return res.json({
        success: false,
        message: "Select atleast 3 genres.",
        data: [],
      });
    }

    console.log(`logging : `, req.userData);

    console.log(req.userData._id);

    const _user = await user.findOne({
      _id: req.userData._id,
    });
    console.log(`_user : `, _user);
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    _user.genre = req.body.genre;
    await _user.save();

    const token = jwt.sign(
      {
        _id: _user._id,
        username: _user.username,
        email: _user.email,
        isEmailVerified: _user.isEmailVerified,
        genre: _user.genre,
        usrStatus: _user.userStatus,
      },
      process.env.jwtKey,
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      success: true,
      message: "Genre added successfuly.",
      data: req.body.genre,
      token: token,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getArtistDetail = async (req, res) => {
  try {
    const { artistId } = req.params;
    console.log(`ID : `, artistId);
    const _artist = await user
      .findOne({
        _id: artistId,
        role: "artist",
        isEmailVerified: true,
        // userStatus: "active",
      })
      .populate([
        {
          path: "musicId",
          model: "Music",
          populate: {
            path: "artistId",
            model: "User",
            select: "username",
          },
        },
        {
          path: "albumId",
          model: "Album",
          populate: [
            {
              path: "artistId",
              model: "User",
              select: "username",
            },
            {
              path: "albumSongsId",
              model: "Music",
              populate: {
                path: "artistId",
                model: "User",
                select: "username",
              },
            },
          ],
        },
      ]);

    return res.json({
      success: true,
      messaage: "Artist details fetched successfully.",
      data: _artist,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const _user = await user.findOne({ email: email });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not exists.",
      });
    }

    await music.deleteMany({ artistId: _user._id });
    await album.deleteMany({ artistId: _user._id });
    await _user.deleteOne({ email: _user.email });

    return res.json({
      success: true,
      message: `${_user.email} deleted successfully.`,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.applyAsArtist = async (req, res) => {
  try {
    const userId = req.userData._id;

    // fetching user if exists?
    const _userDetails = await user.findOne({
      _id: userId,
      role: "user",
    });
    if (!_userDetails) {
      return res.json({
        success: true,
        message: "User not found.",
        data: [],
      });
    }
    // return res.json({ length: _userDetails.samples.length });

    // verifying samples length and mimetypes
    if (!req.files || req.files.length < 1 || req.files.length > 3) {
      return res.json({
        success: false,
        message: "Required samples : minimum 1 and maximum 3.",
      });
    }
    for (let i in req.files) {
      if (req.files[i].mimetype != "audio/mpeg") {
        return res.json({
          success: false,
          message: `File with path : ${req.files[i].path} should have type mp3.`,
        });
      }
    }
    // return res.send(req.files)

    // verify that the user is already registered as artist or not?
    for (let i in _userDetails.role) {
      if (_userDetails.role[i] == "artist") {
        return res.json({
          success: false,
          message: "You are already approved as an artist.",
        });
      }
    }

    // check if samples already uploaded - means requested as artist.
    if (_userDetails.samples.length > 0) {
      return res.json({
        success: false,
        message: "Samples already uploaded. Request is under review.",
      });
    }

    for (let i = 0; i < req.files.length; i++) {
      req.body["file"] = req.files[i];

      // object skeleton to upload
      object = {
        musicName: req.body.musicName,
        musicGenre: req.body.musicGenre,
        dateOfRelease: req.body.dateOfRelease,
        musicDescription: req.body.musicDescription,
        musicLink: await awsFileUpload(undefined, req.body.file.path),
      };
      _userDetails.samples.push(object);
    }

    await _userDetails.save();
    return res.json({
      success: true,
      message: `Artist application and samples submitted successfully, your request is under review.`,
      data: _userDetails.samples,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.editArtistProfile = async (req, res) => {
  try {
    // return res.send(req.userData);
    const artistId = req.userData._id;

    let obj = { ...req.body }; // getting a copy of body...

    // modifying my object....
    if (obj.image == "") {
      delete obj.image;
    }
    if (obj.genre.length == 0) {
      delete obj.genre;
    }
    if (obj.walletAddress == "") {
      delete obj.walletAddress;
    }
    if (Object.keys(obj.socialLinks) == 0) {
      delete obj.socialLinks;
    }

    // return res.send(obj);

    // if everything goes well, check for the genre length, atleat 3...
    if (obj.genre.length < 3) {
      return res.json({
        success: false,
        message: "Please select a minimum of 3 genre.",
        data: [],
      });
    }

    // finding respective user...
    const _user = await user.findOne({
      _id: artistId,
      artistStatus: "approved",
      role: "artist",
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not exists.",
        data: [],
      });
    }

    // getting those keys and values from "obj" that are present and saving only those values in the user...
    for (let i = 0; i < Object.keys(obj).length; i++) {
      _user[Object.keys(obj)[i]] = Object.values(obj)[i];
    }
    await _user.save();
    return res.json({
      success: true,
      message: "Profile information updated successfully.",
      data: _user,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.buyNft = async (req, res) => {
  try {
    const userId = req.userData._id; // get _id of user requesting the route.
    const _user = await user.findOne({
      _id: userId,
    });

    // get cart items of the user
    const _cartItems = await cart.find({
      artistId: userId,
    });

    const { items } = _cartItems[0];
    // return res.send(items);

    // for every item
    for (let i = 0; i < items.length; i++) {
      const { musicId, quantity, price } = items[i]; //extract from music in cart

      // getting music either indivisual music or album
      let _music = await Promise.all([
        await music.findOne({
          _id: musicId,
        }),
        await album.findOne({
          _id: musicId,
        }),
      ]);
      // fi,tering the null music
      _music = _music.filter((elm) => elm != null);
      // return res.send(_music);

      if (_music[0].musicCopies > 0) {
        console.log(`im in if`);
        // transferring ownership to user requesting route
        _music[0].musicCopies = _music[0].musicCopies - quantity;
        if (_music[0].ownerships.length > 0) {
          for (let i = 0; i < _music[0].ownerships.length; i++) {
            if (_music[0].ownerships[i]._id == userId) {
              console.log(`if --`);
              _music[0].ownerships[i].holdedCopies += quantity;
            } else {
              console.log(`else --`);
              _music[0].ownerships.push({
                _id: userId,
                holdedCopies: quantity,
              });
            }
          }
        } else {
          _music[0].ownerships.push({
            _id: userId,
            holdedCopies: quantity,
          });
        }

        await _music[0].save();
        console.log(`music: `, _music[0]);

        // create _finance for artist and add in sales and earnings
        const { artistId } = _music[0];
        const _finance = await finance.findOne({
          artistId: artistId,
        });
        if (!_finance) {
          const newFinance = new finance({
            artistId: artistId,
            totalSales: _music[0]._id,
            totalEarning: price,
          });
          await newFinance.save();
          console.log(`new finance : `, newFinance);
        } else {
          _finance.totalSales.push(_music[0]._id);
          _finance.totalEarning = _finance.totalEarning + price;
          await _finance.save();
          console.log(`_finance : `, _finance);
        }
      } else if (_music[0].albumCopies > 0) {
        // transferring ownership to user requesting route
        _music[0].albumCopies = _music[0].albumCopies - quantity;
        if (_music[0].ownerships.length > 0) {
          for (let i = 0; i < _music[0].ownerships.length; i++) {
            if (_music[0].ownerships[i]._id == userId) {
              console.log(`if --`);
              _music[0].ownerships[i].holdedCopies += quantity;
            } else {
              console.log(`else --`);
              _music[0].ownerships.push({
                _id: userId,
                holdedCopies: quantity,
              });
            }
          }
        } else {
          _music[0].ownerships.push({
            _id: userId,
            holdedCopies: quantity,
          });
        }

        await _music[0].save();
        console.log(`music: `, _music[0]);

        // create _finance for artist and add in sales and earnings
        const { artistId } = _music[0];
        const _finance = await finance.findOne({
          artistId: artistId,
        });
        if (!_finance) {
          const newFinance = new finance({
            artistId: artistId,
            totalSales: _music[0]._id,
            totalEarning: price,
          });
          _user.financeId.push(newFinance._id);
          await _user.save();
          await newFinance.save();
          console.log(`new finance : `, newFinance);
        } else {
          _finance.totalSales.push(_music[0]._id);
          _finance.totalEarning = _finance.totalEarning + price;
          _user.financeId.push(_finance._id);
          await _user.save();
          await _finance.save();
          console.log(`_finance : `, _finance);
        }
      } else if (_music[0].musicCopies < 0 || _music[0].albumCopies < 0) {
        console.log(`im in else`);
        return res.json({
          success: false,
          message: `Music: ${_music[0].musicName} copies are sold out.`,
        });
      }
    }
    return res.json({
      success: true,
      message: "Ownership successfully transferred.",
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.onwed = async (req, res) => {
  try {
    const userId = req.userData._id;

    let tracks = []; //final array of indivisual tracks
    let albums = []; //final array of albums

    const _tracks = await music.find().populate({
      path: "artistId",
      model: "User",
      select: "username",
    });
    // return res.send(_tracks);
    _tracks.map((elm) => {
      console.log(`in map`);
      if (elm.ownerships.length > 0) {
        console.log(`lengt > 0`);
        for (let i = 0; i < elm.ownerships.length; i++) {
          if (elm.ownerships[i]._id == userId) {
            console.log(`id matched`);
            tracks.push(elm);
            console.log(tracks);
          }
        }
      }
    });

    const _albums = await album.find().populate({
      path: "artistId",
      model: "User",
      select: "username",
    });
    // return res.send(_albums);
    _albums.map((elm) => {
      console.log(`in map`);
      if (elm.ownerships.length > 0) {
        console.log(`lengt > 0`);
        for (let i = 0; i < elm.ownerships.length; i++) {
          if (elm.ownerships[i]._id == userId) {
            console.log(`id matched`);
            albums.push(elm);
            console.log(albums);
          }
        }
      }
    });

    if (!_tracks || !_albums || (!_tracks && !_albums)) {
      return res.json({
        success: false,
        message: "No owned NFT's available yet.",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Owned NFT's fetched successfully.",
      data: {
        tracks,
        albums,
      },
    });
  } catch (error) {
    return res.json({
      error: error.messaage,
    });
  }
};

exports.getFinance = async (req, res) => {
  try {
    const artistId = req.userData._id;
    const _financeDetails = await finance.findOne({
      artistId: artistId,
    });
    if (!_financeDetails) {
      return res.json({
        success: false,
        message: "No sales recorded yet.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Finance details fetched successfully.",
      dta: _financeDetails,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getUploadedNfts = async (req, res) => {
  try {
    const artistId = req.userData._id;
    // return res.send(artistId)
    const _artistUploads = await Promise.all([
      await music.find({
        artistId: artistId,
      }),
      await album.find({
        artistId: artistId,
      }),
    ]);
    if (!_artistUploads) {
      return res.json({
        success: false,
        message: "No NFT's uploaded yet.",
        data: [],
      });
    }
    return res.json({
      success: true,
      messgae: "Uploaded NFT's fetched successfully.",
      data: _artistUploads[0],
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.getAllartists = async (req, res) => {
  try {
    const userId = req.userData._id;
    let allArtists = [];
    let followStatus = false;

    const _userDetails = await user.findOne({
      _id: userId,
    });

    const _artists = await user
      .find({
        role: "artist",
      })
      .populate([
        {
          path: "musicId",
          model: "Music",
          populate: {
            path: "artistId",
            model: "User",
            select: "username",
          },
        },
        {
          path: "albumId",
          model: "Album",
          populate: {
            path: "artistId",
            model: "User",
            select: "username",
          },
        },
      ])
      .limit(10);
    if (_artists.length < 1) {
      return res.json({
        success: false,
        message: "No artists available yet.",
      });
    }

    //filtering passwords etc from object
    for (let i = 0; i < _artists.length; i++) {
      //checking followings of user, if user has followed any artist followStatus = true
      for (let j = 0; j < _userDetails.followings.length; j++) {
        if (
          JSON.stringify(_userDetails.followings[j]) ===
          JSON.stringify(_artists[i]._id)
        ) {
          followStatus = true;
        } else {
          followStatus = false;
        }
      }

      const object = {
        _id: _artists[i]._id,
        username: _artists[i].username,
        email: _artists[i].email,
        isEmailVerified: _artists[i].isEmailVerified,
        isGoogleVerified: _artists[i].isGoogleVerified,
        isFacebookVerified: _artists[i].isFacebookVerified,
        genre: _artists[i].genre,
        role: _artists[i].role,
        followers: _artists[i].followers,
        followings: _artists[i].followings,
        musicId: _artists[i].musicId,
        albumId: _artists[i].albumId,
        bio: _artists[i].bio,
        image: _artists[i].image,
        walletAddress: _artists[i].walletAddress,
        followStatus: followStatus,
        artistStatus: _artists[i].artistStatus,
      };

      allArtists.push(object);
    }

    return res.json({
      success: true,
      message: "All artists fetched successfully.",
      data: allArtists,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.feed = async (req, res) => {
  try {
    const userId = req.userData._id;
    const _loggedInUser = await user
      .findOne({
        _id: userId,
      })
      .populate({
        path: "followings",
        model: "User",
        select:
          "_id username email image isEmailVerified isGoogleVerified isFacebookVerified genre userStatus artistStatus role samples followers followings musicId albumId financeId wishlistId",
        populate: [
          {
            path: "musicId",
            model: "Music",
            populate: {
              path: "artistId",
              model: "User",
              select: "username",
            },
          },
          {
            path: "albumId",
            model: "Album",
            populate: [
              {
                path: "artistId",
                model: "User",
                select: "username",
              },
              {
                path: "albumSongsId",
                model: "Music",
              },
            ],
          },
        ],
      });
    if (!_loggedInUser) {
      return res.json({
        success: false,
        message: "You aren't following anyone yet.",
        data: [],
      });
    }
    // const { musicId, albumId } = _loggedInUser.followings;
    return res.json({
      success: true,
      message: "Feed fetched successfully.",
      users: _loggedInUser.followings,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.topArtists = async (req, res) => {
  try {
    const _topArtists = await finance
      .find()
      .populate({
        path: "artistId",
        model: "User",
        select: "_id username email genre image artistStatus role",
      })
      .sort({ totalSales: -1 })
      .limit(10);
    if (_topArtists.length < 1) {
      return res.json({
        success: false,
        message: "No top artists available yet.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Top artists fetched successfully.",
      data: _topArtists,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
