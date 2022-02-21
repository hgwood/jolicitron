import { test } from "tap";
import { normalize } from "./normalize";

test("string implies type", (t) => {
  const actual = normalize("number");
  const expected = { type: "number" };
  t.same(actual, expected);
  t.end();
});

test("array implies object", (t) => {
  const actual = normalize([{ name: "myProperty", value: { type: "number" } }]);
  const expected = {
    type: "object",
    properties: [{ name: "myProperty", value: { type: "number" } }],
  };
  t.same(actual, expected);
  t.end();
});

test("string for a property implies number property", (t) => {
  const actual = normalize({ type: "object", properties: ["myProperty"] });
  const expected = {
    type: "object",
    properties: [{ name: "myProperty", value: { type: "number" } }],
  };
  t.same(actual, expected);
  t.end();
});

test("3-tuple for a property implies array property", (t) => {
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
  t.same(actual, expected);
  t.end();
});

test("2-tuple for a property implies number array property", (t) => {
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
  t.same(actual, expected);
  t.end();
});

test("length implies array", (t) => {
  const actual = normalize({ length: "length" }).type;
  const expected = "array";
  t.same(actual, expected);
  t.end();
});

test("length implies array even if type is specified", (t) => {
  const actual = normalize({ length: "length", type: "number" }).type;
  const expected = "array";
  t.same(actual, expected);
  t.end();
});

test("type of implied array is implied to be item type", (t) => {
  // @ts-ignore
  const actual = normalize({ length: "length", type: "number" }).items?.type;
  const expected = "number";
  t.same(actual, expected);
  t.end();
});

test("array without item type implies array of number", (t) => {
  const actual = normalize({ type: "array", length: "length" });
  const expected = {
    type: "array",
    length: "length",
    items: { type: "number" },
  };
  t.same(actual, expected);
  t.end();
});
