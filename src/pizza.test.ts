import jolicitron, {
  ParserDefinition,
  ShortParserDefinition,
  parseStringDefinition
} from "./parser";
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

const explicitParserDefinition: ParserDefinition = {
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

test("parses the pizza example correctly using the fully explicit definition", t => {
  const actual = jolicitron(explicitParserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});

test("parses the pizza example correctly using the shortest definition possible", t => {
  const parserDefinition: ShortParserDefinition = [
    "nrows",
    "ncolumns",
    "minIngredients",
    "maxCells",
    ["rows", "nrows", "string"]
  ];
  const actual = jolicitron(parserDefinition, input);
  t.deepEqual(actual, expected);
  t.end();
});

test("parses the pizza example correctly using string definition", t => {
  const actual = parseStringDefinition(`{
    nrows ncolumns minIngredients maxCells
    rows<string>[nrows]
  }`);
  const expected = explicitParserDefinition;
  t.deepEqual(actual, expected);
  t.end();
});
