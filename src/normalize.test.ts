import test from "node:test";
import assert from "node:assert";
import { normalize } from "./normalize";

test("string implies type", () => {
  const actual = normalize("number");
  const expected = { type: "number" };
  assert.deepStrictEqual(actual, expected);
});

test("array implies object", () => {
  const actual = normalize([{ name: "myProperty", value: { type: "number" } }]);
  const expected = {
    type: "object",
    properties: [{ name: "myProperty", value: { type: "number" } }],
  };
  assert.deepStrictEqual(actual, expected);
});

test("string for a property implies number property", () => {
  const actual = normalize({ type: "object", properties: ["myProperty"] });
  const expected = {
    type: "object",
    properties: [{ name: "myProperty", value: { type: "number" } }],
  };
  assert.deepStrictEqual(actual, expected);
});

test("3-tuple for a property implies array property", () => {
  const actual = normalize({
    type: "object",
    properties: [["myProperty", "myLength", { type: "string" }]],
  });
  const expected = {
    type: "object",
    properties: [
      {
        name: "myProperty",
        value: {
          type: "array",
          length: "myLength",
          items: { type: "string" },
        },
      },
    ],
  };
  assert.deepStrictEqual(actual, expected);
});

test("2-tuple for a property implies number array property", () => {
  const actual = normalize({
    type: "object",
    properties: [["myProperty", "myLength"]],
  });
  const expected = {
    type: "object",
    properties: [
      {
        name: "myProperty",
        value: {
          type: "array",
          length: "myLength",
          items: { type: "number" },
        },
      },
    ],
  };
  assert.deepStrictEqual(actual, expected);
});

test("length implies array", () => {
  const actual = normalize({ length: "length" }).type;
  const expected = "array";
  assert.deepStrictEqual(actual, expected);
});

test("length implies array even if type is specified", () => {
  const actual = normalize({ length: "length", type: "number" }).type;
  const expected = "array";
  assert.deepStrictEqual(actual, expected);
});

test("type of implied array is implied to be item type", () => {
  // @ts-ignore
  const actual = normalize({ length: "length", type: "number" }).items?.type;
  const expected = "number";
  assert.deepStrictEqual(actual, expected);
});

test("array without item type implies array of number", () => {
  const actual = normalize({ type: "array", length: "length" });
  const expected = {
    type: "array",
    length: "length",
    items: { type: "number" },
  };
  assert.deepStrictEqual(actual, expected);
});
