const mongoose = require("mongoose");

const socialLinks = mongoose.Schema({
  twitter: String,
  instagram: String,
  tiktok: String,
});

const samples = mongoose.Schema({
  musicName: String,
  musicGenre: [{ type: String }],
  dateOfRelease: String,
  musicDescription: String,
  musicLink: String,
});

const userSchema = mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: { type: String },
    bio: String,
    emailConfirmationCode: { type: String }, // random code is generated to verify email
    isEmailVerified: { type: Boolean, default: false }, // true if user has verified email after registering
    isGoogleVerified: { type: Boolean, default: false }, // if user is on platform using google
    isFacebookVerified: { type: Boolean, default: false }, // if usr is on platform from facebook
    passwordResetToken: { type: String, default: "null" }, // uniquely generated for password reset
    socialLinks: socialLinks,
    genre: [{ type: String, required: true }],
    walletAddress: [{ type: String, unique: true }],
    userStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    artistStatus: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
    role: [
      { type: String, enum: ["user", "artist", "admin"], default: "user" },
    ],
    samples: [{ type: samples }],
    followers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    followings: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    musicId: [{ type: mongoose.Types.ObjectId, ref: "Music" }],
    albumId: [{ type: mongoose.Types.ObjectId, ref: "Album" }],
    financeId: [{ type: mongoose.Types.ObjectId, ref: "Finance" }],
    wishlistId: [{ type: mongoose.Types.ObjectId, ref: "Wishlist" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
