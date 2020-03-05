import { test } from "tap";
import { compile } from "./compile";

test("founding a non-number value when expecting a number throws an error", t => {
  const parser = compile({
    type: "number"
  });
  t.throws(() => {
    parser(["not a number"][Symbol.iterator](), { variables: {} });
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
    parser(["1", "2", "3"][Symbol.iterator](), { variables: {} });
  }, RangeError);
  t.end();
});

test("expecting for numbers than there is raises an error", t => {
  const parser = compile({
    type: "object",
    properties: [{ prop1: { type: "number" } }, { prop2: { type: "number" } }]
  });
  t.throws(() => {
    parser(["1"][Symbol.iterator](), { variables: {} });
  }, RangeError);
  t.end();
});

test("expecting for strings than there is raises an error", t => {
  const parser = compile({
    type: "object",
    properties: [{ prop1: { type: "string" } }, { prop2: { type: "string" } }]
  });
  t.throws(() => {
    parser(["1"][Symbol.iterator](), { variables: {} });
  }, RangeError);
  t.end();
});
