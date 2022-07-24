const { tokenVerifier } = require("../middlewares/tokenVerifier");
const { upload } = require("../middlewares/multer");
const musicController = require("../controllers/music");
const { check } = require("express-validator");
const express = require("express");
const music = require("../models/music");
const router = express.Router();

// -------------------------------------------  Music routes...

router.post(
  "/upload/image",
  tokenVerifier,
  upload.single("image"),
  musicController.uploadPicture
);

router.post(
  "/upload/single",
  [
    check("musicName").notEmpty().withMessage("Music name is required."),
    check("musicCopies")
      .notEmpty()
      .withMessage("Available music copies are required."),
    check("musicPrice")
      .notEmpty()
      .withMessage("Please set the price of your NFT."),
    check("musicType").notEmpty().withMessage("Music type is required."),
    check("musicDescription")
      .notEmpty()
      .withMessage("Music description is required."),
    check("previewStart")
      .notEmpty()
      .withMessage("Please provide start limit to cut preview."),
    check("previewEnd")
      .notEmpty()
      .withMessage("Please provide end limit to cut preview."),
    check("rarityLevel")
      .notEmpty()
      .withMessage("Please provide rarity level of your NFT."),
  ],
  upload.single("audio"),
  tokenVerifier,
  musicController.uploadMusic
);

router.post(
  "/upload/many",
  upload.array("audio"),
  tokenVerifier,
  musicController.uploadMany
);

router.get("/detail/:nftId", tokenVerifier, musicController.getNftDetail);

router.patch(
  "/list/unlist/:nftId",
  check("list").notEmpty().withMessage("List status is required."),
  tokenVerifier,
  musicController.listUnlistNft
);

router.get("/list", musicController.getListedNfts);

router.post(
  "/create/album",
  [
    check("albumName").notEmpty().withMessage("Album name is required."),
    check("albumDescription")
      .notEmpty()
      .withMessage("Album description is required."),
    check("albumCopies")
      .notEmpty()
      .withMessage("Album available units are requried."),
    check("albumPrice").notEmpty().withMessage("Album price is required."),
  ],
  tokenVerifier,
  musicController.createAlbum
);

router.get(
  "/fetch/album/:albumId",
  tokenVerifier,
  musicController.fetchAlbumSongs
);

// filtering API's

router.get("/top/selling/tracks", tokenVerifier, musicController.topTracks);

router.get("/top/selling/albums", tokenVerifier, musicController.topAlbums);

router.get("/search/by/genre", tokenVerifier, musicController.searchByGenre);

// passing query params after filter POSTMAN

router.get("/filter", tokenVerifier, musicController.filterNfts);

module.exports = router;
