"use strict"

module.exports = require("../..").build(({push, n}) => [
  "nrows", "nslots", push, "npools", push,
  n("unavailables", "x", "y"),
  n("servers", "size", "capacity")
])
