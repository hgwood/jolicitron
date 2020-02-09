import test from "tape";
import { parseAsNumber, normalizeParser, parseAsArray } from "./parser";

test("explicit parser get through", t => {
  const expected = { name: "name", parser: parseAsNumber };
  const actual = normalizeParser(expected);
  t.deepEqual(actual, expected);
  t.end();
});

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

test("length property means parse as array", t => {
  const expected = {
    name: "array",
    parser: parseAsArray({ length: "length", parser: parseAsNumber })
  };
  const actual = normalizeParser({
    name: "array",
    length: "length",
    parser: parseAsNumber
  });
  t.deepEqual(actual, expected);
  t.end();
});
