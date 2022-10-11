import test from "node:test";
import assert from "node:assert";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`pizza example`, async () => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "pizza-input.txt",
    "pizza-schema.json",
    "pizza-output.json",
  ]);
  const actual = jolicitron(parser, input);
  assert.deepStrictEqual(actual, expected);
});
