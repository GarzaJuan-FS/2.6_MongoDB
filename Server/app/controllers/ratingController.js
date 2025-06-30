const Rating = require("../models/Rating");

exports.getAllRatings = async (req, res) => {
  try {
    // Build query object
    let query = {};

    // Query operators
    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    if (req.query.maxRating) {
      query.rating = { ...query.rating, $lte: parseFloat(req.query.maxRating) };
    }

    if (req.query.gameId) {
      query.gameId = req.query.gameId;
    }

    if (req.query.hasText) {
      // Find ratings that have or don't have rating text
      if (req.query.hasText === "true") {
        query.ratingText = { $exists: true, $ne: null, $ne: "" };
      } else {
        query.ratingText = { $in: [null, ""] };
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Select fields
    let selectFields = "";
    if (req.query.select) {
      selectFields = req.query.select.split(",").join(" ");
    } else if (req.query.exclude) {
      const excludeFields = req.query.exclude.split(",");
      selectFields = excludeFields.map((field) => `-${field}`).join(" ");
    }

    // Sort
    let sortBy = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith("-")
        ? req.query.sort.slice(1)
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;
      sortBy[sortField] = sortOrder;
    } else {
      sortBy = { rating: -1 }; // Default sort by rating descending
    }

    // Execute query
    const ratings = await Rating.find(query)
      .populate("gameId")
      .select(selectFields)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Rating.countDocuments(query);

    res.json({
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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

exports.getRatingsByGame = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const ratings = await Rating.find({ gameId }).populate("gameId");
    res.json({
      ratings,
      count: ratings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
