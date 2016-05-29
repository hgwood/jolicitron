"use strict"

module.exports = require("../..").build(({push, n}) => [
  "nrows", "ncols", "ndrones", "nturns", "maxLoad",
  push.usingName("nitemTypes"),
  n("weights"),
  push,
  n("warehouses", "x", "y", n.usingName("nitemTypes", "items")),
  push,
  n("orders", "x", "y", push, n("items")),
])
