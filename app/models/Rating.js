const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const ratingSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(8), // 8-character short ID
    },
    gameId: { type: String, ref: "Game", required: true },
    ratingText: { type: String },
    rating: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
); // Disable default ObjectId

module.exports = mongoose.model("Rating", ratingSchema);
