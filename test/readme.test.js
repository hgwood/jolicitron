"use strict"

const test = require("tape")
const jolicitron = require("..")

test("string parsers", t => {
  const parser = jolicitron(() => ["a", "b"])
  const {parsedValue, remaining} = parser("41 99 105")
  t.deepEqual(parsedValue, {a: 41, b: 99})
  t.equal(remaining, "105")
  t.end()
})

test("simple n parser", t => {
  const parser = jolicitron((save, n) => [save, n("a")])
  const {parsedValue, remaining} = parser("3 1 2 3 4 5")
  t.deepEqual(parsedValue, {a: [1, 2, 3]})
  t.equal(remaining, "4 5")
  t.end()
})

test("object n parser", t => {
  const parser = jolicitron((save, n) => [
    save,
    n("x", "a", "b")])
  const {parsedValue, remaining} = parser("2 1 2 3 4 5")
  t.deepEqual(parsedValue, {x: [{a: 1, b: 2}, {a: 3, b: 4}]})
  t.equal(remaining, "5")
  t.end()
})

test("complex n parser", t => {
  const parser = jolicitron((save, n) => [
    save,
    n("x",
      "a",
      save,
      n("b", "k", "l")),
    "z"])
  const {parsedValue, remaining} = parser("2 1 2 3 4 5 6 7 3 8 9 10 11 12 13 14 15 16")
  t.deepEqual(parsedValue, {
    x: [
      {
        a: 1,
        b: [
          {k: 3, l: 4},
          {k: 5, l: 6},
        ],
      },
      {
        a: 7,
        b: [
          {k: 8, l: 9},
          {k: 10, l: 11},
          {k: 12, l: 13},
        ],
      },
    ],
    z: 14,
  })
  t.equal(remaining, "15 16")
  t.end()
})
