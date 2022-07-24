const { validationResult } = require("express-validator");
const { uploadToIPFS, IPFS } = require("../helpers/pinata");
const MP3Cutter = require("mp3-cutter");
const user = require("../models/user");
const music = require("../models/music");
const album = require("../models/album");
const { awsFileUpload } = require("../helpers/aws-s3");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const { fileAppender } = require("../helpers/fileAppender");
const fs = require("fs");
const path = require("path");

// upload track and album covers and insert the link in upload music and album API
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

//uploading a single song
exports.uploadMusic = async (req, res) => {
  try {
    // return res.send(req.body);
    console.log(`req body`, req);
    // return res.send(`ok`);
    const fileSize = 10000000;
    const mimeTypes = ["audio/mpeg"];

    //validating fields
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    //Checking if file is uploaded
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
        message: "Format is not correct.",
      });
    }

    const {
      musicName,
      musicCopies,
      musicGenre,
      musicPrice,
      musicImage,
      musicDescription,
      rarityLevel,
      previewStart,
      previewEnd,
      dateOfRelease, // to be placed in dates field in music
      dateOfPost, // to be placed in dates field in music
      uniquePrice,
      auctionStartingPrice,
      auctionEndingDate,
    } = req.body;

    //checking if music exists before or not?
    const _music = await music.findOne({
      musicName: musicName,
      artistId: req.userData._id,
    });
    if (_music) {
      return res.json({
        success: false,
        message:
          "You have already created track with this name, create a unique name for this track.",
        data: [],
      });
    }

    //checking user is available and is artist
    const _user = await user.findOne({
      _id: req.userData._id,
      role: "artist",
      isEmailVerified: true,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    // Extracting the audio duration
    let extractedDuration = await getAudioDurationInSeconds(req.file.path);
    // Converting to minutes fom ms
    extractedDuration = (extractedDuration / 60).toFixed(1);
    console.log(`duration : `, extractedDuration);

    const srcFile = req.file.path;
    //uploading preview to cloudinary
    const cutOptions = {
      src: srcFile,
      target: `./uploads/${Date.now() + req.file.originalname}`,
      start: previewStart,
      end: previewEnd,
    };
    MP3Cutter.cut(cutOptions);
    const dest = cutOptions.target;

    //uploading to cloudinary
    // const previewHash = await cloudinaryUpload(req, res, dest);
    const previewHash = await awsFileUpload(req.file.path, dest);

    //file upload to IPFS
    const ipfsHash = await uploadToIPFS(srcFile, (metadata = undefined));
    console.log(`main IPFS hash : `, ipfsHash);

    // ----------------------------------------

    //object containing hashes
    musicHashes = {
      previewHash: previewHash,
      ipfsHash: ipfsHash,
    };

    // return res.send(musicHashes);

    //creating a new document
    const newMusic = new music({
      artistId: req.userData._id,
      musicName: musicName,
      musicHash: musicHashes,
      musicCopies: musicCopies,
      musicPrice: musicPrice,
      musicImage: musicImage,
      musicGenre: musicGenre,
      musicDescription: musicDescription,
      musicPreviewDuration: { start: previewStart, end: previewEnd },
      musicDuration: extractedDuration,
      rarityLevel: rarityLevel,
      dates: {
        release: dateOfRelease,
        post: dateOfPost,
      },
      bookingType: {
        unique: uniquePrice,
        auction: {
          startingPrice: auctionStartingPrice,
          endingDate: auctionEndingDate,
        },
      },
    });

    // return res.send(newMusic);
    console.log(`newMusic:  `, newMusic);

    //Getting metadata hash
    const metaHash = await uploadToIPFS((file = undefined), newMusic);

    //injecting IPFS hash in the same object
    musicHashes = {
      ...musicHashes,
      metaHash: metaHash,
    };
    newMusic.musicHash = musicHashes;
    console.log(`music : `, newMusic);
    await newMusic.save();

    //assigning music id to user
    _user.musicId.push(newMusic._id);
    await _user.save();

    return res.json({
      success: true,
      message: "Audio uploaded successfully.",
      music: newMusic,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

// uploading more than 1 songs in album
exports.uploadMany = async (req, res) => {
  try {
    // console.log(`request : `, req);
    let readableStream;
    let createdPath = path.join(
      __dirname,
      "../metadata/",
      `${Date.now()}-album-metafile.json`
    );
    const fileSize = 10000000;
    const mimeTypes = ["audio/mpeg"];

    const albumName = req.body.albumName;

    //checking if album exists before or not?
    const _album = await album.findOne({
      albumName: albumName,
      artistId: req.userData._id,
    });
    if (!_album) {
      return res.json({
        success: false,
        message: "Album with this name not exists.",
        data: [],
      });
    }

    //checking if user exists before or not?
    const _user = await user.findOne({
      _id: req.userData._id,
      role: "artist",
      isEmailVerified: true,
    });
    if (!_user) {
      return res.json({
        success: false,
        message: "User not found.",
        data: [],
      });
    }

    console.log(`before loop : `, req.files.length);
    for (let i = 0; i < req.files.length; i++) {
      console.log(`in loop`);
      //checking if music exists before or not?
      const _music = await music.findOne({
        musicName: req.body.musicName,
        artistId: req.userData._id,
        albumId: _album._id,
      });
      if (_music) {
        return res.json({
          success: false,
          message: `You have already created track with this name : ${req.body.musicName}, create a unique name for this track.`,
          data: [],
        });
      }
      req.body["file"] = req.files[i];

      const {
        albumName,
        musicName,
        musicType,
        musicImage,
        musicDescription,
        previewStart,
        previewEnd,
        rarityLevel,
        dateOfRelease, // to be placed in dates field in music
        dateOfPost, // to be placed in dates field in music
        uniquePrice,
        auctionStartingPrice,
        auctionEndingDate,
      } = req.body;

      if (!req.body.file) {
        return res.json({
          success: false,
          message: "File not uploaded.",
        });
      }
      if (req.body.file && req.body.file.size > fileSize) {
        return res.json({
          success: false,
          message:
            "Required file size to be uploaded is less than or equals to 10 MB",
        });
      }
      if (!(req.body.file && mimeTypes.includes(req.body.file.mimetype))) {
        return res.json({
          success: false,
          message: "Format is not correct.",
        });
      }

      // Extracting the audio duration
      let extractedDuration = await getAudioDurationInSeconds(
        req.body.file.path
      );
      // Converting to minutes fom ms
      extractedDuration = (extractedDuration / 60).toFixed(1);
      console.log(`extractedDuration : `, extractedDuration);

      // ------------------------------------------------------

      const srcFile = req.body.file.path;

      const cutOptions = {
        src: srcFile,
        target: `./uploads/${Date.now() + req.body.file.originalname}`,
        start: previewStart,
        end: previewEnd,
      };
      MP3Cutter.cut(cutOptions);
      const dest = cutOptions.target;

      // upload file tio AWS cloud storage
      const previewHash = await awsFileUpload(req.body.file.path, dest);

      //file upload to IPFS
      const ipfsHash = await uploadToIPFS(srcFile, (metadata = undefined));

      // ----------------------------------------

      //object containing hashes
      musicHashes = {
        previewHash: previewHash,
        ipfsHash: ipfsHash,
      };
      // return res.send(musicHashes);
      console.log(`musicHashes : `, musicHashes);

      //creating a new document
      const newMusic = new music({
        albumId: _album._id,
        artistId: req.userData._id,
        musicName: musicName,
        musicHash: musicHashes,
        musicCopies: _album.albumCopies,
        musicGenre: musicType,
        musicImage: musicImage,
        musicDescription: musicDescription,
        musicPreviewDuration: { start: previewStart, end: previewEnd },
        musicDuration: extractedDuration,
        rarityLevel: rarityLevel,
        dateOfRelease, // to be placed in dates field in music
        dateOfPost, // to be placed in dates field in music
        uniquePrice,
        auctionStartingPrice,
        auctionEndingDate,
      });

      //appending music objects in single file
      fileAppender(createdPath, newMusic);

      newMusic.musicHash = musicHashes;
      await newMusic.save();
      // ------------------------------------------------------
      _album.albumSongsId.push(newMusic._id);
    }

    //appending album metadata in same music appended file
    fileAppender(createdPath, _album);

    // read file from server
    readableStream = fs.createReadStream(createdPath);
    //Getting metadata hash after uploading to IPFS
    const metaHash = await IPFS(readableStream);
    // unlinking file from server
    fs.unlinkSync(createdPath);

    //saving returneed hash in album in database
    _album.albumMetahash = metaHash;
    await _album.save();

    //check if album field in user is not containing the album then add it in field
    for (let i in _user.albumId.length) {
      if (_user.albumId[i] != _album._id) {
        _user.albumId.push(_album._id);
      }
    }
    await _user.save();

    return res.json({
      success: true,
      message: "Album uploaded successfully.",
      data: _album,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//get particular nft detail
exports.getNftDetail = async (req, res) => {
  try {
    const { nftId } = req.params;
    const _musicNft = await music.findOne({
      _id: nftId,
    });
    if (!_musicNft) {
      return res.json({
        success: false,
        message: "NFT not found.",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Detail fetched successfully.",
      data: _musicNft,
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

//move nft to and fro fom listed
exports.listUnlistNft = async (req, res) => {
  try {
    const { nftId } = req.params;
    const { list } = req.body;

    const _musicNft = await music.findOne({ _id: nftId });
    if (!_musicNft) {
      return res.json({
        success: false,
        message: "Music not found.",
        data: [],
      });
    }

    if (_musicNft.isListed === list) {
      if (list == true) {
        return res.json({
          success: false,
          message: "This nft is already listed.",
          data: [],
        });
      } else {
        return res.json({
          success: false,
          message: "This nft is already unlisted.",
          data: [],
        });
      }
    }

    _musicNft.isListed = list;
    await _musicNft.save();
    if (list == true) {
      return res.json({
        success: true,
        message: "Nft listed successfully.",
        data: _musicNft.isListed,
      });
    } else {
      return res.json({
        success: true,
        message: "Nft unlisted successfully.",
        data: _musicNft.isListed,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//fetch list of all listed music nft's
exports.getListedNfts = async (req, res) => {
  try {
    const _tracks = await music.find().populate([
      {
        path: "artistId",
        model: "User",
        select: "username",
      },
      {
        path: "albumId",
        model: "Album",
        select: "albumName",
      },
    ]);
    const _albums = await album.find().populate([
      {
        path: "artistId",
        model: "User",
        select: "username",
      },
      {
        path: "albumSongsId",
        model: "Music",
      },
    ]);

    const allNfts = [..._tracks, ..._albums];

    if (_tracks.length < 1 && _albums.length < 1) {
      return res.json({
        success: false,
        message: "No music nft's are listed yet.",
        data: {
          _tracks,
          _albums,
        },
      });
    }
    return res.json({
      success: true,
      message: "List fetched successfully.",
      data: allNfts,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//creating album
exports.createAlbum = async (req, res) => {
  try {
    const { albumName, albumDescription, albumCopies, albumPrice } = req.body;

    //checking if user exists and is artist;
    const _user = await user.findOne({
      _id: req.userData._id,
      role: "artist",
    });
    if (!_user) {
      return res.json({
        success: false,
        message:
          "You are not allowed to access this route. Please apply for artist first.",
        data: [],
      });
    }

    //checking if album exists with same name for this artist;
    const _album = await album.findOne({
      albumName: albumName,
      artistId: req.userData._id,
    });
    if (_album) {
      return res.json({
        success: true,
        message:
          "Album with this name already exists. Create a unique name for this album.",
        data: [],
      });
    }

    //saving the album;
    const newAlbum = new album({
      artistId: req.userData._id,
      albumName: albumName,
      albumDescription: albumDescription,
      albumCopies: albumCopies,
      albumPrice: albumPrice,
    });
    await newAlbum.save();

    await _user.albumId.push(newAlbum._id);
    await _user.save();

    return res.json({
      success: true,
      message: "Album created successfully.",
      data: newAlbum,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//fetch songs available in album
exports.fetchAlbumSongs = async (req, res) => {
  try {
    const { albumId } = req.params;
    const _albumMusic = await album
      .findOne({ _id: albumId })
      .populate({ path: "albumSongsId", model: "Music" });

    if (!_albumMusic) {
      return res.json({
        success: false,
        message: "Album is not available now.",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Music NFT's fetched successfully.",
      data: _albumMusic.albumSongsId,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.topTracks = async (req, res) => {
  try {
    let _topTracks = await music
      .find({
        musicCopies: { $gt: 0 },
      })
      .populate({
        path: "artistId",
        model: "User",
        select: "username",
      })
      .sort({ ownerships: -1 })
      .limit(10);
    _topTracks = _topTracks.filter((elm) => !elm.albumId);
    if (_topTracks.length < 0) {
      return res.json({
        success: false,
        message: "No top trending tracks are available yet.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "All top trending tracks fetched successfully.",
      data: _topTracks,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.topAlbums = async (req, res) => {
  try {
    const _topAlbums = await album
      .find({
        albumCopies: { $gt: 0 },
      })
      .populate({
        path: "artistId",
        model: "User",
        select: "username",
      })
      .sort({ ownerships: -1 })
      .limit(10);
    if (_topAlbums.length < 0) {
      return res.json({
        success: false,
        message: "No top trending Albums are available yet.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "All top trending Albums fetched successfully.",
      data: _topAlbums,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.searchByGenre = async (req, res) => {
  try {
    const { genre } = req.body;
    // return res.send(genre);

    const _artists = await user
      .find({ role: "artist", genre: { $in: genre } })
      .select(
        "_id email username role isEmailVerified isGoogleVerified isFacebookVerified genre followers followings musicId albumId"
      );
    let _tracks = await music
      .find({
        musicCopies: { $gt: 0 },
        musicGenre: { $in: genre },
      })
      .populate({
        path: "albumId",
        model: "Album",
      });
    const indivisualTracks = _tracks.filter((elm) => !elm.albumId);
    const albums = _tracks.filter((elm) => elm.albumId);
    return res.json({
      success: true,
      message:
        "Artists, albums and tracks according to genre fetched successfully.",
      data: {
        artists: _artists,
        tracks: indivisualTracks,
        albums: albums,
      },
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.filterNfts = async (req, res) => {
  try {
    const pageNo = req.query.page; // page no, should start from 0;
    const perPage = 10;

    const filterByPost = req.query.filterByPost;
    let rarityLevel = req.query.rarityLevel;
    let lowerPrice = req.query.lowerPrice;
    let upperPrice = req.query.upperPrice;

    if (!rarityLevel) {
      rarityLevel = [
        "Relic",
        "Legendary",
        "Treasure",
        "Rare",
        "Lucky",
        "Accessible",
      ];
    }
    if (!lowerPrice && !upperPrice) {
      (lowerPrice = 0), (upperPrice = 1000);
    } else {
    }

    let newArrivals;

    // fetch all posted songs
    if (filterByPost == "all") {
      newArrivals = await music
        .find({
          rarityLevel: rarityLevel,
          musicPrice: { $gte: lowerPrice, $lte: upperPrice },
        })
        .populate({
          path: "artistId",
          model: "User",
          select: "username",
        })
        .populate({
          path: "albumId",
          model: "Album",
        })
        .sort({
          createdAt: -1,
        })
        .limit(perPage)
        .skip(perPage * pageNo);
    }
    // fetch all tracks
    else if (filterByPost == "tracks") {
      newArrivals = await music
        .find({
          rarityLevel: rarityLevel,
          musicPrice: { $gte: lowerPrice, $lte: upperPrice },
        })
        .populate({
          path: "artistId",
          model: "User",
          select: "username",
        })
        .sort({
          createdAt: -1,
        })
        .limit(perPage)
        .skip(perPage * pageNo);
    }
    //fecth all albums
    else if (filterByPost == "albums") {
      newArrivals = await music
        .find({
          rarityLevel: rarityLevel,
          // musicPrice: { $gte: lowerPrice, $lte: upperPrice },
        })
        .populate({
          path: "artistId",
          model: "User",
          select: "username",
        })
        .populate({
          path: "albumId",
          model: "Album",
        })
        .sort({
          createdAt: -1,
        })
        .limit(perPage)
        .skip(perPage * pageNo);

      // checking albums, if they are in price range
      for (let i = 0; i < newArrivals.length; i++) {
        if (
          newArrivals[i].albumId &&
          newArrivals[i].albumId.albumPrice >= lowerPrice &&
          newArrivals[i].albumId.albumPrice <= upperPrice
        ) {
          // delete newArrivals[i];
        } else {
          delete newArrivals[i];
        }
      }

      // filtering null values
      newArrivals = newArrivals.filter((elm) => elm != null);
    }
    // fecth albums and tracks of last 2 weeks
    else if (filterByPost == "newest") {
      newArrivals = await music
        .find({
          rarityLevel: rarityLevel,
          musicPrice: { $gte: lowerPrice, $lte: upperPrice },
          createdAt: {
            $gte: new Date().getTime() - 1000 * 3600 * 24 * 7 * 2, //createdAt >= last 2 weeks
          },
        })
        .sort({
          createdAt: -1,
        })
        .limit(perPage)
        .skip(perPage * pageNo);
    }
    //if filterBy param is not correct
    else {
      return res.json({
        success: false,
        message: "Filter applied is not correct.",
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "All posted NFT's fetched successfully.",
      data: newArrivals,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
