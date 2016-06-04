"use strict"

const test = require("tape")
const jolicitron = require("..")

test("n.usingName uses the given named variable as the length of the array", t => {
  const {parsedValue} = jolicitron((save, n) => [
    save("name"),
    n.usingName("name", "value"),
  ])("2 5 8 7")
  t.deepEqual(parsedValue, {value: [5, 8]})
  t.end()
})
