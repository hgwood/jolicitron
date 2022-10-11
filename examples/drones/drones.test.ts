import test from "node:test";
import assert from "node:assert";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`drones example`, async () => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "drones-input.txt",
    "drones-schema.json",
    "drones-output.json",
  ]);
  const actual = jolicitron(parser, input);
  assert.deepStrictEqual(actual, expected);
});
