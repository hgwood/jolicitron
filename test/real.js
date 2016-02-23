"use strict"

const test = require("tape")
const assert = require("assert")
const fs = require("fs")
const _ = require("lodash")

const bucket = require("../bucket")

test("drones - simple", t => {
  const input = fs.readFileSync("./test/inputs/drones/simple.in.txt", "utf8")
  const parser = bucket.buildParser(b =>
    b.merge([
      b.object(["nrows", "ncols", "ndrones", "nturns", "maxLoad"], b.int()),
      b.pair("nitemTypes", b.int()),
      b.pair("weights", b.array("nitemTypes", b.int())),
      b.pair("nwarehouses", b.int()),
      b.pair("warehouses", b.array("nwarehouses", b.merge([
        b.object(["x", "y"], b.int()),
        b.pair("items", b.array("nitemTypes", b.int()))
      ]))),
      b.pair("norders", b.int()),
      b.pair("orders", b.array("norders", b.merge([
        b.object(["x", "y"], b.int()),
        b.pair("nitems", b.int()),
        b.pair("items", b.array("nitems", b.int()))
      ])))
    ])
  )
  const parserResult = parser(input)
  assert(_.isEmpty(parserResult.remaining))
  assert.deepEqual(parserResult.result, {
    nrows: 100,
    ncols: 100,
    ndrones: 3,
    nturns: 50,
    maxLoad: 500,
    nitemTypes: 3,
    weights: [100, 5, 450],
    nwarehouses: 2,
    warehouses: [
      {x: 0, y: 0, items: [5, 1, 0]},
      {x: 5, y: 5, items: [0, 10, 2]}
    ],
    norders: 3,
    orders: [
      {x: 1, y: 1, nitems: 2, items: [2, 0]},
      {x: 3, y: 3, nitems: 3, items: [0, 0, 0]},
      {x: 5, y: 6, nitems: 1, items: [2]}
    ]
  })
  t.end()
})

test("data center - simple", t => {
  const input = fs.readFileSync("./test/inputs/data-center/simple.in.txt", "utf8")
  const parser = bucket.buildParser(b =>
    b.merge([
      b.object(["nrows", "nslots", "nunavailables", "npools", "nservers"], b.int()),
      b.pair("unavailables", b.array("nunavailables", b.object(["x", "y"], b.int()))),
      b.pair("servers", b.array("nservers", b.object(["size", "capacity"], b.int()))),
    ])
  )
  const parserResult = parser(input)
  assert(_.isEmpty(parserResult.remaining))
  assert.deepEqual(parserResult.result, {
    nrows: 2,
    nslots: 5,
    nunavailables: 1,
    npools: 2,
    nservers: 5,
    unavailables: [
      {x: 0, y: 0},
    ],
    servers: [
      {size: 3, capacity: 10},
      {size: 3, capacity: 10},
      {size: 2, capacity: 5},
      {size: 1, capacity: 5},
      {size: 1, capacity: 1}
    ]
  })
  t.end()
})