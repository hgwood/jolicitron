"use strict"

const test = require("tape")
const assert = require("assert")

const bucket = require("../bucket")

test("parses zero", t => {
  assert.equal(bucket.int("0"), 0)
  t.end()
})

test("parses one", t => {
  assert.equal(bucket.int("1"), 1)
  t.end()
})

test("parses a large integer", t => {
  assert.equal(bucket.int("998237"), 998237)
  t.end()
})

test("rejects floats", t => {
  assert.throws(() => {
    bucket.int("1.1")
  }, /expected int/)
  t.end()
})