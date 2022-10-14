import test from "node:test";
import assert from "node:assert";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`book scanning example`, async () => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "book-scanning-input.txt",
    "book-scanning-schema.json",
    "book-scanning-output.json",
  ]);
  const actual = jolicitron(parser, input);
  assert.deepStrictEqual(actual, expected);
});
