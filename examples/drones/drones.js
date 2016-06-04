"use strict"

module.exports = require("../..")((save, n) => [
  "nrows", "ncols", "ndrones", "nturns", "maxLoad",
  save.usingName("nitemTypes"),
  n("weights"),
  save,
  n("warehouses", "x", "y", n.usingName("nitemTypes", "items")),
  save,
  n("orders", "x", "y", save, n("items")),
])
