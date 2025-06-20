const express = require("express");
const connectDB = require("./db/config");
const gameRoutes = require("./routes/gameRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Mount routers
app.use("/api/games", gameRoutes);
app.use("/api/ratings", ratingRoutes);

module.exports = app;
