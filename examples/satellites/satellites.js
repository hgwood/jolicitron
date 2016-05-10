"use strict"

module.exports = require("../..").build(({push, n}) => [
  "nturns",
  push,
  n("satellites", "latitude", "longitude", "velocity", "maximumOrientationChange", "maximumOrientation"),
  push,
  n("imageCollections",
    "value", push, push,
    n("locations", "latitude", "longitude"),
    n("timeRanges", "start", "end")),
])
