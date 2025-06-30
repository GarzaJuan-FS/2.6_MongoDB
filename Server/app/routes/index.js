const express = require("express");
const router = express.Router();
const gameRoutes = require("./gameRoutes");
const ratingRoutes = require("./ratingRoutes");

router.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: `${req.method} - Request made`, success: true });
});

router.use("/games", gameRoutes);
router.use("/ratings", ratingRoutes);

module.exports = router;
