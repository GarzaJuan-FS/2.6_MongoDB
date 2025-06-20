const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const gameSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(8), // 8-character short ID
    },
    title: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date },
    platform: { type: [String], required: true },
  },
  { _id: false }
); // Disable default ObjectId

module.exports = mongoose.model("Game", gameSchema);
