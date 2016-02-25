"use strict"

module.exports = require("../..").build(p =>
  p.merge([
    p.object(["nrows", "ncols", "ndrones", "nturns", "maxLoad"], p.int()),
    p.pair("nitemTypes", p.int()),
    p.pair("weights", p.array("nitemTypes", p.int())),
    p.pair("nwarehouses", p.int()),
    p.pair("warehouses", p.array("nwarehouses", p.merge([
      p.object(["x", "y"], p.int()),
      p.pair("items", p.array("nitemTypes", p.int())),
    ]))),
    p.pair("norders", p.int()),
    p.pair("orders", p.array("norders", p.merge([
      p.object(["x", "y"], p.int()),
      p.pair("nitems", p.int()),
      p.pair("items", p.array("nitems", p.int())),
    ]))),
  ]))
