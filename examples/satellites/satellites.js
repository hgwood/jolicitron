"use strict"

module.exports = require("../..").build(p =>
  p.merge([
    p.pair("nturns", p.int()),
    p.pair("nsatellites", p.int()),
    p.pair("satellites", p.array("nsatellites", p.merge([
      p.object(["latitude", "longitude", "velocity", "maximumOrientationChange", "maximumOrientation"], p.int()),
    ]))),
    p.pair("nimageCollections", p.int()),
    p.pair("imageCollections", p.array("nimageCollections", p.merge([
      p.object(["value", "nlocations", "ntimeRanges"], p.int()),
      p.pair("locations", p.array("nlocations", p.merge([
        p.object(["latitude", "longitude"], p.int()),
      ]))),
      p.pair("timeRanges", p.array("ntimeRanges", p.merge([
        p.object(["start", "end"], p.int()),
      ]))),
    ]))),
  ]))
