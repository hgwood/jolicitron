import { test } from "tap";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`book scanning example`, async (t) => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "book-scanning-input.txt",
    "book-scanning-schema.json",
    "book-scanning-output.json",
  ]);
  const actual = jolicitron(parser, input);
  t.same(actual, expected);
  t.end();
});
