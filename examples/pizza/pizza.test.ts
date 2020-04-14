import { test } from "tap";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`pizza example`, async t => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "pizza-input.txt",
    "pizza-schema.json",
    "pizza-output.json"
  ]);
  const actual = jolicitron(parser, input);
  t.deepEqual(actual, expected);
  t.end();
});
