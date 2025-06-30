const express = require("express");
const cors = require("cors");
const { connectDB } = require("./app/db/config");
const routes = require("./app/routes");

// Connect to database
connectDB();

const app = express();

// CORS middleware - Allow frontend to connect
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ], // Multiple ports for dev
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json());

// Base API route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running", success: true });
});

// Mount all routes
app.use("/api", routes);

module.exports = app;
