import test from "tape";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`drones example`, async t => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "drones-input.txt",
    "drones-parser.json",
    "drones-output.json"
  ]);
  const actual = jolicitron(parser, input);
  t.deepEqual(actual, expected);
  t.end();
});
