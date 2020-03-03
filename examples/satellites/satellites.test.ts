import test from "tape";
import jolicitron from "../../src";
import { readTestData } from "../../test/test-utils";

test(`satellites example`, async t => {
  const [input, parser, expected] = await readTestData(__dirname, [
    "satellites-input.txt",
    "satellites-parser.json",
    "satellites-output.json"
  ]);
  const actual = jolicitron(parser, input);
  t.deepEqual(actual, expected);
  t.end();
});
