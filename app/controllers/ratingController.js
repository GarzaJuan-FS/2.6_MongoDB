const Rating = require("../models/Rating");

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().populate("gameId");
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRatingById = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id).populate("gameId");
    if (!rating) return res.status(404).json({ error: "Rating not found" });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRating = async (req, res) => {
  const { gameId, ratingText, rating } = req.body;

  // Check if gameId exists
  if (!gameId) {
    return res.status(400).json({
      error: "gameId is required",
    });
  }

  try {
    const newRating = new Rating(req.body);
    const savedRating = await newRating.save();
    res.status(201).json(savedRating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRating)
      return res.status(404).json({ error: "Rating not found" });
    res.json(updatedRating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const deletedRating = await Rating.findByIdAndDelete(req.params.id);
    if (!deletedRating)
      return res.status(404).json({ error: "Rating not found" });
    res.json({ message: "Rating deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
