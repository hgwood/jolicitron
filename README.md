# Jolicitron

A library to quickly build parsers for Google Hash Code problem inputs.

![License](https://img.shields.io/npm/l/jolicitron.svg)
![Latest version on npm](https://img.shields.io/npm/v/jolicitron.svg)
![npm dependencies status](https://img.shields.io/david/hgwood/jolicitron.svg)
![Total number of downloads on npm](https://img.shields.io/npm/dt/jolicitron.svg)

## How to use it

Jolicitron is mainly about assigning names to integers. Hash Code problem
inputs look like this:

```
1 2 3 4
3
4 5
6 7
8 9
10 11 12
```

Using the problem statement, this can be made sense of, and it needs to be
parsed into a data structure that has descriptive names. Here's how to do
that with Jolicitron:

```js
const jolicitron = require("jolicitron")

const parser = jolicitron((save, n) => [
  "one", "two", "three", "four",
  save(),
  n("pairs", "x", "y"),
  "ten", "eleven", "twelve"
])
const {parsedValue, remaining} = parser(input)
```

`parsedValue` is then equal to the following:

```
{
  one: 1, two: 2, three: 3, four: 4,
  pairs: [{x: 4, y: 5}, {x: 6, y: 7}, {x: 8, y: 9}],
  ten: 10, eleven: 11, twelve: 12,
}
```

## Real-world Hash Code examples

Check out the [examples](https://github.com/hgwood/hash-code-parser/tree/master/examples)
to understand how to use Jolicitron on passed problems.

## Requirements

Jolicitron is written in ECMAScript 2015 so it requires Node 6+.

## API

Jolicitron exports an object with a single method named `build`.

`build` takes a function that returns a description of the parser you want to
build, and returns the actual parser. A parser, in Jolicitron's context, is
a function that takes a string and returns an object with two
properties: `parsedValue` is the value that resulted from the parsing
operation, and `remaining` is the rest of the string that wasn't used.

For example, a parser that would expect two integers and return an array of
these two integers would work like this:

```js
const parser = jolicitron(...)
const {parsedValue, remaining} = parser("41 99 105")
assert.deepEqual(parsedValue, [41, 99])
assert.equal(remaining, "105")
```

Hash Code problem inputs are usually made of a sequence of integers, separated
by either spaces or new lines. Jolicitron does not care about spaces or new
lines. It sees the input a sequence of integers, that can be parsed
individually or grouped. Therefore, the function passed to `build` should
return an array of description of parsers to use to parse the sequence. The
first parser in the array will be used to parse the first integer, the
second parser, the second integer, and so on. The result from each parser is
expected to be an object, and all these objects are merged together (think
`Object.assign`) to form the final result.

A description for a parser in the array can be one of 3 things:
- a string
- a call `save`
- a call to `n` or `n.usingName`

A string produces a parser that parses one integer, and returns an object that
associates the string to that integer.

```js
const parser = jolicitron(() => ["a", "b"])
const {parsedValue, remaining} = parser("41 99 105")
assert.deepEqual(parsedValue, {a: 41, b: 99})
assert.equal(remaining, "105")
```

`save` and `n` are the parameters passed to the function passed to
jolicitron.

```js
jolicitron((save, n) => [...])
```

They are used to handle collections of things in the input.

Hash Code problem inputs often use the same pattern for collections. The
length of the collection is given first, and then the collection itself.
Sometimes the length and the collection are a little more apart. So a system
to remember values and re-use them later as lengths is required. `save` is
the way to save values, and `n` is used to parse collections.

`save` is a function. It produces a parser that parses one integer, and
stores it in a queue. The integer is then available for later use with `n`.
`save` takes an optional parameter to name the integer. This makes it
available even after it has been dequeued by `n`.

`n` is a function. It produces a parser that parses many integers into an
array, then returns an object that associates its first parameter to that
array. To know exactly how many integer it should parse, `n` dequeues an
integer from `save`'s queue and uses that. The integer is then thrown away.

```js
const parser = jolicitron((save, n) => [save(), n("a")])
const {parsedValue, remaining} = parser("3 1 2 3 4 5")
assert.deepEqual(parsedValue, {a: [1, 2, 3]})
assert.equal(remaining, "4 5")
```

`n.usingName` lets you use a named integer instead.

```js
const parser = jolicitron((save, n) => [
  save("i"),
  save(),
  n.usingName("i", "a")
])
const {parsedValue, remaining} = parser("3 4 1 2 3 4 5")
assert.deepEqual(parsedValue, {a: [1, 2, 3]})
assert.equal(remaining, "4 5")
```

`n` and `n.usingName` throw errors if the queue is empty or if the name is
unknown, respectively.

`n` and `n.usingName` can take additional parameters. If those are present,
they are used to describe how to parse each element of the resulting array,
and the description of parsers seen before: strings, calls to `n` or calls to
`save`.

```js
const parser = jolicitron((save, n) => [
  save(),
  n("x", "a", "b")
])
const {parsedValue, remaining} = parser("3 1 2 3 4 5")
assert.deepEqual(parsedValue, {x: [{a: 1, b: 2}, {a: 3, b: 4}]})
assert.equal(remaining, "5")
```

```js
const parser = jolicitron((save, n) => [
  save(),
  n("x",
    "a",
    save(),
    n("b", "k", "l")),
  "z"
])
const {parsedValue, remaining} = parser("2 1 2 3 4 5 6 7 3 8 9 10 11 12 13 14 15 16")
assert.deepEqual(parsedValue, {
  x: [
    {
      a: 1,
      b: [
        {k: 3, l: 4},
        {k: 5, l: 6}
      ],
    },
    {
      a: 7,
      b: [
        {k: 8, l: 9},
        {k: 10, l: 11},
        {k: 12, l: 13}
      ],
    },
  ],
  z: 14,
})
assert.equal(remaining, "15 16")
```

### Options for `n`

`n` can be given options object as a first parameter: `n("things", {...}, "a", "b", ...)`.

Possible options are:
- `indices` (boolean, defaults to `false`): elements of the parsed array will
have an `index` property denoting their order. This can be useful as indices
are known to often play the role of IDs in Hash Code problems.

## Changelog

- 1.1.0
  - `indices` option for `n`
- 1.0.2
  - package.json/readme update
  - example for https://tonicdev.com/npm/jolicitron
- 1.0.1
  - package.json/readme update
- 1.0.0
  - initial release
