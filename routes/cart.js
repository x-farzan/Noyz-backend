const { tokenVerifier } = require("../middlewares/tokenVerifier");
const cartController = require("../controllers/cart");
const { check } = require("express-validator");
const router = require("express").Router();

router.post(
  "/add/:itemId",
  check("quantity")
    .notEmpty()
    .withMessage("Provide quantity for item to be added in cart."),
  tokenVerifier,
  cartController.addToCart
);
router.get("/fetch", tokenVerifier, cartController.cartDetails);
router.delete("/delete/:itemId", tokenVerifier, cartController.removeFromCart);
router.patch("/empty", tokenVerifier, cartController.emptyCart);

module.exports = router;
