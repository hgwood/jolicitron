"use strict"

const test = require("tape")
const assert = require("assert")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

test("data center example", t => {
  const input = fs.readFileSync(path.join(__dirname, "data-center.in.txt"), "utf8")
  const parser = require(path.join(__dirname, "data-center"))
  const result = parser(input)
  assert(_.isEmpty(result.remaining))
  assert.deepEqual(result.parsedValue, require(path.join(__dirname, "data-center.out")))
  t.end()
})
