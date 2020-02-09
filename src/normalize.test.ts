import test from "tape";
import { normalize, ObjectParserDefinition } from "./parser";

test("number type is implied", t => {
  const expected = { name: "name", type: "number" };
  const actual = normalize({ name: "name" });
  t.deepEqual(actual, expected);
  t.end();
});

test("array is implied object", t => {
  const properties: ObjectParserDefinition["properties"] = [
    { name: "name", type: "number" }
  ];
  const expected = { type: "object", properties };
  const actual = normalize(properties);
  t.deepEqual(actual, expected);
  t.end();
});

test("string is implied number property", t => {
  const expected = { name: "name", type: "number" };
  const actual = normalize("name");
  t.deepEqual(actual, expected);
  t.end();
});
