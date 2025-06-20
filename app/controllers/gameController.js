const Game = require("../models/Game");

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGame = async (req, res) => {
  try {
    const newGame = new Game(req.body);
    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedGame) return res.status(404).json({ error: "Game not found" });
    res.json(updatedGame);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) return res.status(404).json({ error: "Game not found" });
    res.json({ message: "Game deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
