const express = require("express");
const router = express.Router();
const authorRoutes = require("./authorRoutes");

router.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: `${req.method} - Request made`, success: true });
});

router.use("/authors", authorRoutes);

module.exports = router;
