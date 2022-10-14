import test from "node:test";
import assert from "node:assert";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`data center example`, async () => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "data-center-input.txt",
    "data-center-schema.json",
    "data-center-output.json",
  ]);
  const actual = jolicitron(parser, input);
  assert.deepStrictEqual(actual, expected);
});
