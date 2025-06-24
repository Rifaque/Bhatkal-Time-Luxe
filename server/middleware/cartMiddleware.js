const mongoose = require("mongoose");

function getCartId(req, res, next) {
  // Retrieve cartId from session
  let cartId = req.session.cartId;
  if (!cartId) {
    // Generate a new cart ID using MongoDB ObjectId string
    cartId = new mongoose.Types.ObjectId().toString();
    req.session.cartId = cartId;
  }
  req.cartId = cartId;
  next();
}

module.exports = { getCartId };

