"use strict"

module.exports = require("../..").build((save, n) => [
  "nrows", "nslots", save, "npools", save,
  n("unavailables", "x", "y"),
  n("servers", "size", "capacity"),
])
