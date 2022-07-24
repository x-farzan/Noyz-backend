const cookieParser = require("cookie-parser");
const userRoutes = require("../routes/user");
const adminRoutes = require("../routes/admin");
const authRoutes = require("../routes/auth");
const musicRoutes = require("../routes/music");
const wishlistRoutes = require("../routes/wishlist");
const cartRoutes = require("../routes/cart");
const walletRoutes = require("../routes/wallet");
const express = require("express");

module.exports = (app) => {
  app.use(express.json());
  app.use(cookieParser());
  app.use("/noyz/auth", authRoutes);
  app.use("/noyz/user", userRoutes);
  app.use("/noyz/admin", adminRoutes);
  app.use("/noyz/music", musicRoutes);
  app.use("/noyz/wishlist", wishlistRoutes);
  app.use("/noyz/cart", cartRoutes);
  app.use("/noyz/wallets", walletRoutes);
};
