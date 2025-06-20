const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  ratingText: { type: String },
  rating: { type: Number, min: 0, max: 10 },
});

module.exports = mongoose.model("Rating", ratingSchema);
