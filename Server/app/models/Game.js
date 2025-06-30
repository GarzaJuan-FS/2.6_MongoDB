const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const gameSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(8), // 8-character short ID
  },
  title: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  platform: [
    {
      type: String,
    },
  ],
  releaseDate: {
    type: Date,
  },
  developer: {
    type: String,
  },
  publisher: {
    type: String,
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model("Game", gameSchema);
