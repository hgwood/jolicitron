"use strict"

const test = require("tape")
const assert = require("assert")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

test("drones example", t => {
  const input = fs.readFileSync(path.join(__dirname, "drones.in.txt"), "utf8")
  const parser = require(path.join(__dirname, "drones"))
  const parserResult = parser(input)
  assert(_.isEmpty(parserResult.remaining))
  assert.deepEqual(parserResult.result, require(path.join(__dirname, "drones.out")))
  t.end()
})