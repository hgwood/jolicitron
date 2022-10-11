import test from "node:test";
import assert from "node:assert";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`satellites example`, async () => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "satellites-input.txt",
    "satellites-schema.json",
    "satellites-output.json",
  ]);
  const actual = jolicitron(parser, input);
  assert.deepStrictEqual(actual, expected);
});
