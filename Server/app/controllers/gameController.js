const Game = require("../models/Game");

exports.getAllGames = async (req, res) => {
  try {
    // Build query object
    let query = {};

    // Query operators
    if (req.query.genre) {
      query.genre = { $regex: req.query.genre, $options: "i" }; // Case-insensitive search
    }

    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    if (req.query.maxRating) {
      query.rating = { ...query.rating, $lte: parseFloat(req.query.maxRating) };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Select fields (exclude sensitive data)
    let selectFields = "";
    if (req.query.select) {
      selectFields = req.query.select.split(",").join(" ");
    } else if (req.query.exclude) {
      // Ex: exclude description and developer
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
      sortBy = { name: 1 }; // Default sort by name ascending
    }

    // Execute query
    const games = await Game.find(query)
      .select(selectFields)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Game.countDocuments(query);

    res.json({
      games,
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
