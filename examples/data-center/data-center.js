"use strict"

module.exports = require("../..").buildParser(b =>
  b.merge([
    b.object(["nrows", "nslots", "nunavailables", "npools", "nservers"], b.int()),
    b.pair("unavailables", b.array("nunavailables", 
      b.object(["x", "y"], b.int()))),
    b.pair("servers", b.array("nservers", 
      b.object(["size", "capacity"], b.int()))),
  ]))
