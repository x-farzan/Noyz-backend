const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId },
    // musicId: [{ type: mongoose.Types.ObjectId, ref: "Music" }],
    // albumId: [{ type: mongoose.Types.ObjectId, ref: "Album" }],
    wishlist: [{ type: mongoose.Types.ObjectId, refPath: "onModel" }],
    onModel: [
      {
        type: String,
        enum: ["Music", "Album"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
