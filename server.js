const express = require("express");
const path = require("path");
const configureHandlebars = require("./config/handlebars");
const { computeNextState } = require("./lib/conway");

const app = express();
const PORT = 3000;
const GRID_SIZE = 20;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Setup Handlebars
configureHandlebars(app);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let SIMULATION_SPEED = 1000; // milliseconds

app.post("/speed", (req, res) => {
  const newSpeed = parseInt(req.body.speed);
  if (newSpeed >= 50 && newSpeed <= 5000) {
    SIMULATION_SPEED = newSpeed;
    res.render("partials/controls", {
      layout: false,
      speed: SIMULATION_SPEED,
    });
  } else {
    res.status(400).send("Speed must be between 50 and 5000ms");
  }
});

// Process cell update
app.post("/cell/:x/:y", async (req, res) => {
  await sleep(SIMULATION_SPEED);

  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y);

  const { state, neighbors } = req.body;

  console.log("########################");
  console.log("Current cell state:", state);
  console.log("Neighbor states:", neighbors);
  console.log("########################");

  const newState = computeNextState(state, neighbors.filter(Boolean));

  res.set("HX-Trigger", `update-cell-${x}-${y}`);
  res.render("partials/cell", {
    layout: false,
    x: x,
    y: y,
    alive: newState === "1",
    GRID_SIZE,
  });
});

app.get("/", (req, res) => {
  res.render("board", { GRID_SIZE });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
