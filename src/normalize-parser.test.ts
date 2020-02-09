import test from "tape";
import { parseAsNumber, normalizeParser } from "./parser";

test("parse as number by default", t => {
  const expected = { name: "name", parser: parseAsNumber };
  const actual = normalizeParser({ name: "name" });
  t.deepEqual(actual, expected);
  t.end();
});

test("string input means parse as number with given name", t => {
  const expected = { name: "name", parser: parseAsNumber };
  const actual = normalizeParser("name");
  t.deepEqual(actual, expected);
  t.end();
});

