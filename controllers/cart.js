const cart = require("../models/cart");
const music = require("../models/music");
const album = require("../models/album");
const { validationResult } = require("express-validator");

// serves role for create, update in CRUD
exports.addToCart = async (req, res) => {
  try {
    //validating fields
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        errors: errors.array(),
      });
    }

    const { itemId } = req.params; //getting nftid from params
    const { quantity } = req.body; // getting nft copies to add in cart

    let result = await Promise.all([
      music.findOne({ _id: itemId }),
      album.findOne({ _id: itemId }),
    ]);
    result = result.filter((elm) => elm != null);
    const { _id, musicPrice, musicCopies, albumPrice, albumCopies } = result[0];
    // return res.send(result[0])

    //check if quantity is larger than the available units
    if (
      (musicCopies && quantity > musicCopies) ||
      (albumCopies && quantity > albumCopies)
    ) {
      return res.json({
        success: false,
        message: "Quantity is greater than the available units.",
        data: [],
      });
    }

    let _cart = await cart.findOne({ artistId: req.userData._id });
    // return res.send(_cart)

    if (_cart) {
      //------if cart exists-------

      // check if item is already added? if yes, get index
      let itemIndex = _cart.items.findIndex((elm) => elm.musicId == itemId);
      // return res.send(`cart found : `, itemIndex)

      if (itemIndex > -1) {
        //--------if item already added update it

        let productItem = _cart.items[itemIndex];
        productItem.quantity = quantity;
        productItem.total = musicPrice
          ? musicPrice * quantity
          : albumPrice * quantity;
        _cart.items[itemIndex] = productItem;
      } else {
        //------if item not added add it------
        // return res.send(`cart found but item not exists`);

        // return res.json({
        //   musicPrice: musicPrice,
        //   albumPrice: albumPrice,
        //   // price: musicPrice || albumPrice,
        //   // total: musicPrice ? musicPrice * quantity : albumPrice * quantity,
        // });
        _cart.items.push({
          musicId: _id,
          quantity: quantity,
          price: musicPrice || albumPrice,
          total: musicPrice ? musicPrice * quantity : albumPrice * quantity,
        });
        // return res.send(_cart);
      }

      // subTotal maintains the total of all items in cart
      _cart.subTotal = _cart.items.reduce((acc, item) => acc + item.total, 0);

      await _cart.save();
      return res.json({
        success: true,
        message: "Item successfully updated and added to cart.",
        data: _cart,
      });
    } else {
      //----if cart not exists----

      // create new cart and add item

      let _newCart = await cart.create({
        artistId: req.userData._id,
        items: {
          musicId: _id,
          quantity: quantity,
          price: musicPrice || albumPrice,
          total: musicPrice ? musicPrice * quantity : albumPrice * quantity,
        },
      });
      // return res.send(`cart exists : `, _newCart);

      // subTotal maintains the total of all items in cart
      _newCart.subTotal = _newCart.items.reduce(
        (acc, item) => acc + item.total,
        0
      );

      _newCart = await _newCart.save();
      return res.json({
        success: true,
        message: "Cart created and item successfully added.",
        data: _newCart,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//serves purpose of read in CRUD
exports.cartDetails = async (req, res) => {
  try {
    const { _id } = req.userData;
    let array = [];
    const _cart = await cart.findOne({ artistId: _id }).populate({
      path: "artistId",
      model: "User",
      select: "username",
    });
    if (!_cart) {
      return res.json({
        success: false,
        message: "Cart not found.",
        data: [],
      });
    }
    return res.json({
      success: true,
      message: "Cart details fetched successfully.",
      data: _cart,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

//server purpose of delete in CRUD
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const _cart = await cart.findOne({ artistId: req.userData._id });
    if (!_cart) {
      return res.json({
        success: false,
        message: "Cart not found.",
        data: [],
      });
    }
    let itemIndex = _cart.items.findIndex((elm) => elm.musicId == itemId);
    if (itemIndex > -1) {
      _cart.items = _cart.items.filter((elm) => elm.musicId != itemId);
      _cart.subTotal = _cart.items.reduce((acc, item) => acc + item.total, 0);
      await _cart.save();
      return res.json({
        success: false,
        message: "Item removed from your cart successfully.",
        data: _cart,
      });
    } else {
      return res.json({
        success: false,
        message: "Item is not yet added in your cart.",
        data: [],
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

exports.emptyCart = async (req, res) => {
  try {
    const _cart = await cart.findOne({ artistId: req.userData._id });
    if (!_cart) {
      return res.json({
        success: false,
        message: "Cart not found.",
        data: [],
      });
    }
    _cart.items = [];
    _cart.subTotal = 0;
    await _cart.save();
    return res.json({
      success: false,
      message: "Cart emptied successfully.",
      data: _cart,
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};
