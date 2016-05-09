"use strict"

const test = require("tape")
const assert = require("assert")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")

test("satellites example", t => {
  const input = fs.readFileSync(path.join(__dirname, "satellites.in.txt"), "utf8")
  const parser = require(path.join(__dirname, "satellites"))
  const parserResult = parser(input)
  assert(_.isEmpty(parserResult.remaining))
  assert.deepEqual(parserResult.result, require(path.join(__dirname, "satellites.out")))
  t.end()
})
