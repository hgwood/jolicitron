import jolicitron, { ParserDefinition } from "./parser";
import test from "tape";

const parserDefinition: ParserDefinition = {
  type: "object",
  properties: [
    { name: "nrows", type: "number" },
    { name: "ncolumns", type: "number" },
    { name: "minIngredients", type: "number" },
    { name: "maxCells", type: "number" },
    {
      name: "rows",
      type: "array",
      length: "nrows",
      items: {
        type: "string"
      }
    }
  ]
};

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

test("parses the pizza example correctly", t => {
  const actual = jolicitron(parserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});
