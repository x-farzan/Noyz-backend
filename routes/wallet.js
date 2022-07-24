const router = require("express").Router();
const { check } = require("express-validator");
const walletController = require("../controllers/wallet");
const { tokenVerifier } = require("../middlewares/tokenVerifier");

router.patch(
  "/add",
  [
    check("walletAddress")
      .notEmpty()
      .withMessage("Wallet address is required."),
  ],
  tokenVerifier,
  walletController.addWallets
);

router.get("/fetch", tokenVerifier, walletController.fetchWallets);

module.exports = router;
