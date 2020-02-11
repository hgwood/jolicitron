import jolicitron, { ParserDefinition, ShortParserDefinition } from "./parser";
import test from "tape";

const input = `
  3 5 1 6
  TTTTT
  TMMMT
  TTTTT
`;

const expected = {
  nrows: 3,
  ncolumns: 5,
  minIngredients: 1,
  maxCells: 6,
  rows: ["TTTTT", "TMMMT", "TTTTT"]
};

test("parses the pizza example correctly using the fully explicit definition", t => {
  const parserDefinition: ParserDefinition = {
    type: "object",
    properties: [
      { nrows: { type: "number" } },
      { ncolumns: { type: "number" } },
      { minIngredients: { type: "number" } },
      { maxCells: { type: "number" } },
      {
        rows: {
          type: "array",
          length: "nrows",
          items: {
            type: "string"
          }
        }
      }
    ]
  };
  const actual = jolicitron(parserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});

test("parses the pizza example correctly using the shortest definition possible", t => {
  const parserDefinition: ShortParserDefinition = [
    "nrows",
    "ncolumns",
    "minIngredients",
    "maxCells",
    ["rows", "nrows", { type: "string" }]
  ];
  const actual = jolicitron(parserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});
