const mongoose = require("mongoose");

const financeSchema = mongoose.Schema({
  artistId: { type: mongoose.Types.ObjectId, ref: "User" },
  totalSales: [{ type: mongoose.Types.ObjectId, refPath: "onModel" }],
  totalEarning: { type: Number, default: 0 },
  onModel: {
    type: String,
    enum: ["Music", "Album"],
  },
});

module.exports = mongoose.model("Finance", financeSchema);
