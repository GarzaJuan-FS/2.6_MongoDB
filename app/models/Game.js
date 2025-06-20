const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: Date },
  platform: { type: [String], required: true },
});

module.exports = mongoose.model("Game", gameSchema);
