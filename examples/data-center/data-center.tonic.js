/**
 * This is for use with Tonic.
 * https://tonicdev.com/npm/jolicitron
 * 
 * It shows how to use jolicitron to parse inputs for the data center problem
 * from the Google Hash Code 2015 qualification round.
 */

const jolicitron = require("jolicitron")

const parser = jolicitron.build(({push, n}) => [
  "nrows", "nslots", push, "npools", push,
  n("unavailables", "x", "y"),
  n("servers", "size", "capacity")
])

const input = `2 5 1 2 5
0 0
3 10
3 10
2 5
1 5
1 1`

parser(input)
