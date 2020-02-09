import {
  parseAsObject,
  parseAsArray,
  parseAsNumber,
  parseAsString
} from "./parser";
import test from "tape";

const parse = parseAsObject([
  { name: "nrows", parser: parseAsNumber },
  { name: "ncolumns", parser: parseAsNumber },
  { name: "minIngredients", parser: parseAsNumber },
  { name: "maxCells", parser: parseAsNumber },
  {
    name: "rows",
    parser: parseAsArray({ length: "nrows", parser: parseAsString })
  }
]);

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
  const { value: actual } = parse(input);
  t.deepEqual(actual, expected);
  t.end();
});
