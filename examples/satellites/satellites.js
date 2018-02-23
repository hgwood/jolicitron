"use strict";

module.exports = require("../..")((save, n) => [
  "nturns",
  save(),
  n(
    "satellites",
    "latitude",
    "longitude",
    "velocity",
    "maximumOrientationChange",
    "maximumOrientation"
  ),
  save(),
  n(
    "imageCollections",
    "value",
    save(),
    save(),
    n("locations", "latitude", "longitude"),
    n("timeRanges", "start", "end")
  )
]);
