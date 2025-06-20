const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const routehandler = require("./app/routes");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is runnning", success: true });
});

app.use("/api/v1", routehandler);

module.exports = app;
