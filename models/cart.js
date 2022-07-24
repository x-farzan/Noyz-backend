const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let itemSchema = new Schema(
  {
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
    },
    quantity: {
      type: Number,
      // required: true,
      min: [1, "Quantity can not be less then 1."],
    },
    price: {
      type: Number,
      // required: true,
    },
    total: {
      type: Number,
      default: 0,
      // required: true,
    },
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
const cartSchema = new Schema(
  {
    artistId: {
      //it is actually userId
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [itemSchema],
    subTotal: {
      // subTotal maintains the total of all items in cart
      default: 0,
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Cart", cartSchema);
