"use strict"

module.exports = require("../..").buildParser(b =>
  b.merge([
    b.object(["nrows", "ncols", "ndrones", "nturns", "maxLoad"], b.int()),
    b.pair("nitemTypes", b.int()),
    b.pair("weights", b.array("nitemTypes", b.int())),
    b.pair("nwarehouses", b.int()),
    b.pair("warehouses", b.array("nwarehouses", b.merge([
      b.object(["x", "y"], b.int()),
      b.pair("items", b.array("nitemTypes", b.int())),
    ]))),
    b.pair("norders", b.int()),
    b.pair("orders", b.array("norders", b.merge([
      b.object(["x", "y"], b.int()),
      b.pair("nitems", b.int()),
      b.pair("items", b.array("nitems", b.int())),
    ]))),
  ]))
