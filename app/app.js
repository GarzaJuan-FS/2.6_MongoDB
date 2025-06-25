const express = require("express");
const { connectDB } = require("./db/config");
const routes = require("./routes");

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Base API route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running", success: true });
});

// Mount all routes
app.use("/api", routes);

module.exports = app;
