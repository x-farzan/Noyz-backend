const { tokenVerifier } = require("../middlewares/tokenVerifier");
const userController = require("../controllers/user");
const { upload } = require("../middlewares/multer");
const { check } = require("express-validator");
const express = require("express");
const router = express.Router();

// -------------------------------------------  User routes...

router.post(
  "/profile/picture",
  upload.single("image"),
  userController.uploadPicture
);

router.post("/edit/profile", tokenVerifier, userController.editProfile);

router.get("/profile/detail", tokenVerifier, userController.getUserDetail);

router.post("/follow/:artistId", tokenVerifier, userController.followArtist);

router.post(
  "/unfollow/:artistId",
  tokenVerifier,
  userController.unfollowArtist
);

router.get(
  "/followers/list",
  tokenVerifier,
  userController.artistFollowersList
);

router.get(
  "/followings/list",
  tokenVerifier,
  userController.artistFollowingList
);

router.post(
  "/connect/wallet",
  check("walletAddress").notEmpty().withMessage("Wallet Address is required."),
  tokenVerifier,
  userController.connectWallet
);

router.post(
  "/add/genre",
  check("genre").notEmpty().withMessage("Select atleast 3 genres."),
  tokenVerifier,
  userController.addGenre
);

router.get(
  "/artist/detail/:artistId",
  tokenVerifier,
  userController.getArtistDetail
);

// for automation instead of manually deleting
router.delete("/delete", userController.deleteUser);

router.post(
  "/apply/artist",
  tokenVerifier,
  upload.array("sample"),
  userController.applyAsArtist
);

router.post(
  "/artist/edit/profile",
  tokenVerifier,
  userController.editArtistProfile
);

// for user only
router.post("/buy/nft", tokenVerifier, userController.buyNft);

router.get("/owned", tokenVerifier, userController.onwed);

//for sales/finance stats
router.get("/finance", tokenVerifier, userController.getFinance);

router.get("/all/uploads", tokenVerifier, userController.getUploadedNfts);

router.get("/fetch/all/artists", tokenVerifier, userController.getAllartists);

router.get("/feed", tokenVerifier, userController.feed);

router.get("/top/artists", tokenVerifier, userController.topArtists);

// router.get(
//   "/get/follow/status",
//   tokenVerifier,
//   userController.checkFollowStatus
// );

module.exports = router;
