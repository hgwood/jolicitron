"use strict";

module.exports = require("../..")((save, n) => [
  "nrows",
  "ncols",
  "ndrones",
  "nturns",
  "maxLoad",
  save("nitemTypes"),
  n("weights"),
  save(),
  n("warehouses", "x", "y", n("items", { length: "nitemTypes" })),
  save(),
  n("orders", "x", "y", save(), n("items"))
]);
