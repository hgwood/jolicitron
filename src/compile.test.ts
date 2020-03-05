import { test } from "tap";
import { compile } from "./compile";

test("founding a non-number value when expecting a number throws an error", t => {
  const parser = compile({
    type: "number"
  });
  t.throws(() => {
    parser(["not a number"][Symbol.iterator](), {});
  }, RangeError);
  t.end();
});

test("refering to unknown variable raises an error", t => {
  const parser = compile({
    type: "array",
    length: "non existing variable",
    items: { type: "number" }
  });
  t.throws(() => {
    parser(["1", "2", "3"][Symbol.iterator](), {});
  }, RangeError);
  t.end();
});
