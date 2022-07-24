const mongoose = require("mongoose");

// const musicHashes = new mongoose.Schema({
//   previewHash: String,
//   ipfsHash: String,
//   metaHash: String,
// });

const musicSchema = mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId, ref: "User" },
    albumId: { type: mongoose.Types.ObjectId, ref: "Album" },
    musicName: { type: String, required: true },
    musicPrice: { type: Number },
    musicImage: String,
    musicHash: {
      previewHash: String,
      ipfsHash: String,
      metaHash: String,
    },
    musicCopies: { type: Number, min: 0 },
    musicGenre: [{ type: String }],
    musicDescription: { type: String },
    musicPreviewDuration: { start: Number, end: Number },
    musicDuration: String,
    musicPlayedTimes: { type: Number, default: 0 },
    isListed: { type: Boolean, default: false },
    rarityLevel: {
      type: String,
      enum: ["Relic", "Legendary", "Treasure", "Rare", "Lucky", "Accessible"],
    },
    dates: {
      // holds when nft posted adn when to be released
      release: { type: String },
      post: { type: String },
    },
    bookingType: {
      unique: { type: Number },
      auction: {
        startingPrice: { type: Number },
        endingDate: { type: String },
      },
    },
    ownerships: [{ _id: mongoose.Types.ObjectId, holdedCopies: Number }],
    // financeId: [{ type: mongoose.Types.ObjectId, ref: "Finance" }],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Music", musicSchema);
