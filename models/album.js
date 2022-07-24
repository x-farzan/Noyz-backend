const mongoose = require("mongoose");
const musicSchema = require("../models/user");

const albumSchema = mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId },
    albumName: { type: String },
    albumDescription: { type: String },
    albumSongsId: [{ type: mongoose.Types.ObjectId, ref: "Music" }],
    albumCopies: Number,
    albumPrice: Number,
    albumMetahash: String,
    ownerships: [{ _id: mongoose.Types.ObjectId, holdedCopies: Number }],
    // financeId: [{ type: mongoose.Types.ObjectId, ref: "Finance" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Album", albumSchema);
