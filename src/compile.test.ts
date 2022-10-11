import test from "node:test";
import assert from "node:assert";
import { compile } from "./compile";

test("founding a non-number value when expecting a number throws an error", () => {
  const parser = compile({
    type: "number",
  });
  assert.throws(() => {
    parser(["not a number"][Symbol.iterator](), new Map());
  }, RangeError);
});

test("refering to unknown variable raises an error", () => {
  const parser = compile({
    type: "array",
    length: "non existing variable",
    items: { type: "number" },
  });
  assert.throws(() => {
    parser(["1", "2", "3"][Symbol.iterator](), new Map());
  }, RangeError);
});

test("expecting for numbers than there is raises an error", () => {
  const parser = compile({
    type: "object",
    properties: [
      { name: "prop1", value: { type: "number" } },
      { name: "prop2", value: { type: "number" } },
    ],
  });
  assert.throws(() => {
    parser(["1"][Symbol.iterator](), new Map());
  }, RangeError);
});

test("expecting for strings than there is raises an error", () => {
  const parser = compile({
    type: "object",
    properties: [
      { name: "prop1", value: { type: "string" } },
      { name: "prop2", value: { type: "string" } },
    ],
  });
  assert.throws(() => {
    parser(["1"][Symbol.iterator](), new Map());
  }, RangeError);
});
