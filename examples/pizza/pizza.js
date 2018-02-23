"use strict";

module.exports = require("../..")((save, n) => [
  save(),
  "ncolumns",
  "minIngredients",
  "maxCells",
  n("rows", "row")
]);
