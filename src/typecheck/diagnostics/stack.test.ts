import test from "node:test";
import assert from "node:assert";
import { buildStack, stackToLines } from "./stack";

test("empty stack", () => {
  const expected: unknown[] = [];
  const actual = buildStack(null, []);
  assert.deepStrictEqual(actual, expected);
});

test("one-level stack", () => {
  const expected: unknown[] = [{ path: [0], value: [0] }];
  const actual = buildStack([0], [0]);
  assert.deepStrictEqual(actual, expected);
});

test("five-level stack", () => {
  const root = [
    {
      prop: [
        0,
        1,
        2,
        3,
        { otherProp: ["array", "of", 4, "things"], unusedProp: 42 },
      ],
    },
  ] as const;
  const expected: unknown[] = [
    {
      path: [1],
      value: root[0].prop[4].otherProp,
    },
    { path: ["otherProp", 1], value: root[0].prop[4] },
    { path: [4, "otherProp", 1], value: root[0].prop },
    {
      path: ["prop", 4, "otherProp", 1],
      value: root[0],
    },
    {
      path: [0, "prop", 4, "otherProp", 1],
      value: root,
    },
  ];
  const actual = buildStack(root, [0, "prop", 4, "otherProp", 1]);
  assert.deepStrictEqual(actual, expected);
});

test("stackToLines", (t) => {
  t.test("empty stack", () => {
    assert.deepStrictEqual(stackToLines([]), []);
  });

  t.test("one-item stack", () => {
    const actual = stackToLines([{ path: [], value: null }]);
    const expected = ["at $ in 'null'"];
    assert.deepStrictEqual(actual, expected);
  });

  t.test("five-item stack", () => {
    const actual = stackToLines([
      { path: [], value: null },
      { path: [1, 2, 3], value: 1 },
      { path: ["1", "2", "3"], value: "null" },
      { path: ["one", "two", "three"], value: 908 },
      {
        path: [1000, "1000", "one thousand", "a fourth item just because"],
        value: true,
      },
    ]);
    const expected = [
      "at $ in 'null'",
      "at $[1][2][3] in '1'",
      "at $[1][2][3] in '\"null\"'",
      "at $.one.two.three in '908'",
      'at $[1000][1000]["one thousand"]["a fourth item just because"] in \'true\'',
    ];
    assert.deepStrictEqual(actual, expected);
  });
});
