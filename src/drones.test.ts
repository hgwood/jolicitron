import jolicitron, { ParserDefinition } from "./parser";
import test from "tape";

const parserDefinition: ParserDefinition = {
  type: "object",
  properties: [
    { nrows: { type: "number" } },
    { ncols: { type: "number" } },
    { ndrones: { type: "number" } },
    { nturns: { type: "number" } },
    { maxLoad: { type: "number" } },
    { nitemTypes: { type: "number" } },
    {
      weights: {
        type: "array",
        length: "nitemTypes",
        items: { type: "number" }
      }
    },
    { nwarehouses: { type: "number" } },
    {
      warehouses: {
        type: "array",
        length: "nwarehouses",
        items: {
          type: "object",
          properties: [
            { x: { type: "number" } },
            { y: { type: "number" } },
            {
              items: {
                type: "array",
                length: "nitemTypes",
                items: { type: "number" }
              }
            }
          ]
        }
      }
    },
    { norders: { type: "number" } },
    {
      orders: {
        type: "array",
        length: "norders",
        items: {
          type: "object",
          properties: [
            { x: { type: "number" } },
            { y: { type: "number" } },
            { nitems: { type: "number" } },
            {
              items: {
                type: "array",
                length: "nitems",
                items: {
                  type: "number"
                }
              }
            }
          ]
        }
      }
    }
  ]
};

const input = `
  100 100 3 50 500
  3
  100 5 450
  2
  0 0
  5 1 0
  5 5
  0 10 2
  3
  1 1
  2
  2 0
  3 3
  3
  0 0 0
  5 6
  1
  2
`;

const expected = {
  nrows: 100,
  ncols: 100,
  ndrones: 3,
  nturns: 50,
  maxLoad: 500,
  nitemTypes: 3,
  weights: [100, 5, 450],
  nwarehouses: 2,
  warehouses: [
    { x: 0, y: 0, items: [5, 1, 0] },
    { x: 5, y: 5, items: [0, 10, 2] }
  ],
  norders: 3,
  orders: [
    { x: 1, y: 1, nitems: 2, items: [2, 0] },
    { x: 3, y: 3, nitems: 3, items: [0, 0, 0] },
    { x: 5, y: 6, nitems: 1, items: [2] }
  ]
};

test("parses the drone example correctly", t => {
  const actual = jolicitron(parserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});
