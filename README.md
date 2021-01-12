# Jolicitron

A library and CLI to quickly build parsers for Google Hash Code problem inputs.

## How to use it

Jolicitron is mainly about assigning names to integers. Hash Code problem inputs
look like this:

```
3 2 4
3
4 5
6 7
8 9
10 11
```

Using the problem statement, this can be made sense of, and it's useful to parse
it into a data structure that has descriptive names. For example, say the
problem is about drones carrying items, and we would like this as an output:

```json
{
  "nsteps": 3,
  "nitems": 2,
  "ndrones": 4,
  "drones": [
    { "x": 4, "y": 5 },
    { "x": 6, "y": 7 },
    { "x": 8, "y": 9 }
  ],
  "itemWeights": [10, 11]
}
```

Jolicitron can help us do that. But we need to work first. We need to describe
how the output should look like and it which order its pieces appear in the
input file. This is done using a what jolicitron calls a schema. It's a JSON
value that's similar to a JSON Schema. Here's a schema that works for the above
input:

```json
{
  "type": "object",
  "properties": [
    {
      "name": "nsteps",
      "value": {
        "type": "number"
      }
    },
    {
      "name": "nitems",
      "value": {
        "type": "number"
      }
    },
    {
      "name": "ndrones",
      "value": {
        "type": "number"
      }
    },
    {
      "name": "drones",
      "value": {
        "type": "array",
        "length": "ndrones",
        "items": {
          "type": "object",
          "properties": [
            {
              "name": "x",
              "value": {
                "type": "number"
              }
            },
            {
              "name": "y",
              "value": {
                "type": "number"
              }
            }
          ]
        }
      }
    },
    {
      "name": "items",
      "value": {
        "type": "array",
        "length": "nitems",
        "items": {
          "type": "number"
        }
      }
    }
  ]
}
```

This is a handful, but there's lots of shortcuts that can help write compact
schemas. Keep on reading for more.

Once we have schema, we run the following command, given the schema has been
saved to `schema.json` and the input to `input.txt`:

```sh
npx jolicitron --schema=schema.json --input=input.txt --output=output.json
```

And that's it really!

## Writing schemas

Schemas describe both how to read the values in the input file and how to
arrange them into a JSON structure.

### Basic schemas

Jolicitron reads the input file as a sequence of tokens. Tokens are groups of
characters that are neither spaces or newlines. Tokens can be parsed into two
types: `number` or `string`. A schema to parse a single token to a number is `{
"type": "number" }` or simply `"number"`. Same with `string`. Those basic types
can be aggregated into objects and arrays.

### Object schemas

A schema describing an object has the following form:

```json
{
  "type": "object",
  "properties": [
    { "name": "property1", "value": <schema for the property> },
    ...other properties
  ]
}
```

Notice that `properties` is an array. That's important because this array
denotes the order in which the properties appear in the input file.

An object schema can be shortened to its `property` array, so this schema:

```json
[
  { "name": "property1", "value": <schema for the property> },
  ...other properties
]
```

...is equivalent to the previous one.

Properties can also be shortened in different ways.

A property of type `number` can be shortened to its property name, so the schema
`["property1"]` is the same as `[{ "name": "property1", "value": "number" }]`.

Properties that are arrays of numbers can be shortened to `["propertyName",
"arrayLength"]`. This is expanded to:

```json
{
  "name": "propertyName",
  "value": {
    "type": "array",
    "length": "arrayLength",
    "items": "number"
  }
}
```

A third element can be added to the short array form to specify the item schema.
For example, `["propertyName", "arrayLength", "string"]` denotes a property that
is array of string. Note that the third element can be any schema, not just
simple types.

### Array schemas

A schema describing an array has the following form:

```json
{
  "type": "array",
  "length": <reference to a variable>,
  "items": <schema for the items of the array>
}
```

`length` must be the name of a property in the same object where the array is,
or a parent object. This property must be of type number, and the number
collected when reading the input file must denote the length of the array.

Example:

```json
[
  "arrayLength",
  {
    "name": "arrayProperty",
    "value": {
      "type": "array",
      "length": "arrayLength",
      ...
    }
  }
]
```

When writing array schemas, the `type` property may be  omitted (`length` is
enough to assume the schema is for an array). If `items` is omitted, jolicitron
assumes an array of numbers.

## Real-world examples

Check out the
[examples](https://github.com/hgwood/jolicitron/tree/master/examples) to
understand how to use jolicitron on passed Hash Code problems.

## Command-line interface

See `npx jolicitron --help`.

## Programmatic interface

```js
import jolicitron from "jolicitron";

const schema = ["nitems", ["items", "nitems", ["weight"]]];
const input = "3 1 10 100";
const result = jolicitron(schema, input);
console.log(result);
// logs { nitems: 3, items: [{ weight: 1 }, { weight: 10 }, { weight: 100 }]}
```

## Changelog

- 3.0.0
  - *breaking* refactor: basically a complete rewrite
    - new API
    - orders of magnitude faster
- 2.1.0
  - support for string tokens
    - ⚠ if your program relies on the fact that string tokens raise errors, then
      this is actually a breaking change
- 2.0.1
  - documentation fixes
- 2.0.0
  - *breaking* refactor: made builder parameters positional (see #11)
  - *breaking* refactor: module exports the build function directly (see #10)
  - *breaking* refactor: `save` and `save.usingName(name)` collapsed into a
    single `save([name])`
  - *breaking* refactor: replaced `n.usingName` with `n`'s `length` option
- 1.1.0
  - `indices` option for `n`
- 1.0.2
  - package.json/readme update
  - example for https://tonicdev.com/npm/jolicitron
- 1.0.1
  - package.json/readme update
- 1.0.0
  - initial release
