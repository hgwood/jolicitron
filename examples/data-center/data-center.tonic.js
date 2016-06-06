/**
 * This is for use with Tonic.
 * https://tonicdev.com/npm/jolicitron
 * 
 * It shows how to use jolicitron to parse inputs for the data center problem
 * from the Google Hash Code 2015 qualification round.
 * https://hashcode.withgoogle.com/2015/tasks/hashcode2015_qualification_task.pdf
 */

const jolicitron = require("jolicitron")

const parser = jolicitron((save, n) => [
  "nrows", "nslots", save(), "npools", save(),
  n("unavailables", "x", "y"),
  n("servers", "size", "capacity"),
])

const input = `2 5 1 2 5
0 0
3 10
3 10
2 5
1 5
1 1`

parser(input)
