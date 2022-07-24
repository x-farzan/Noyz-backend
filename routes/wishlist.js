const router = require("express").Router();
const wishlistController = require("../controllers/wishlist");
const { tokenVerifier } = require("../middlewares/tokenVerifier");

router.post("/add/:id", tokenVerifier, wishlistController.addToWishlist);

router.get("/get", tokenVerifier, wishlistController.getFromWishlist);

router.patch(
  "/remove/:nftId",
  tokenVerifier,
  wishlistController.removeFromWishlist
);

// api to get which items are added in wishlist by logged in user.
// to manage hearts state in app
router.get("/added", tokenVerifier, wishlistController.getAdded);

module.exports = router;
