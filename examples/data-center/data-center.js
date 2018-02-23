"use strict";

module.exports = require("../..")((save, n) => [
  "nrows",
  "nslots",
  save(),
  "npools",
  save(),
  n("unavailables", "x", "y"),
  n("servers", "size", "capacity")
]);
