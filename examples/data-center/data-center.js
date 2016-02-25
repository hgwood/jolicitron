"use strict"

module.exports = require("../..").build(p =>
  p.merge([
    p.object(["nrows", "nslots", "nunavailables", "npools", "nservers"], p.int()),
    p.pair("unavailables", p.array("nunavailables", 
      p.object(["x", "y"], p.int()))),
    p.pair("servers", p.array("nservers", 
      p.object(["size", "capacity"], p.int()))),
  ]))
