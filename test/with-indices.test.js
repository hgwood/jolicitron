"use strict"

const test = require("tape")
const jolicitron = require("..")

test("enabling the `indices` option adds indices to elements of the parsed array", t => {
  const {parsedValue} = jolicitron((save, n) => [
    save(),
    n("things", {indices: true}, "value"),
  ])("2 5 8 7")
  t.deepEqual(parsedValue, {things: [{value: 5, index: 0}, {value: 8, index: 1}]})
  t.end()
})
