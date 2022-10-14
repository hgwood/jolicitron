import test from "node:test";
import assert from "node:assert";
import { typecheckSchemaAt, expectProperty } from "./typecheckAt";

test("valid schema with all combinations of valid schemas", () => {
  const schemaIn = {
    // explicit object schema
    type: "object",
    properties: [
      // explicit property schema
      {
        name: "property1",
        value: "number",
      },
      // number property
      "property2",
      // array of number property
      ["property3", "length3"],
      // explicit array property
      ["property4", "length4", "number"],

      // implicit object schema, empty
      { name: "property5", value: [] },
      // implicit object schema, not empty
      { name: "property6", value: ["subproperty1", "subproperty2"] },
      // implicit array of number schema
      { name: "property7", value: { length: "length7" } },
      // array of number schema
      { name: "property8", value: { length: "length8", type: "number" } },
      // array of string schema
      { name: "property9", value: { length: "length8", type: "string" } },
      // array of number schema
      { name: "property11", value: { length: "length8", type: "array" } },
      // explicit array schema
      {
        name: "property12",
        value: { length: "length8", type: "array", items: "number" },
      },
      // array of number schema
      { name: "property13", value: { length: "length8", items: "number" } },
      // explicit number
      { name: "property14", value: { type: "number" } },
      // explicit string
      { name: "property15", value: { type: "string" } },
    ],
  };
  const schemaOut = typecheckSchemaAt(schemaIn, []);
  assert.deepStrictEqual(schemaOut, schemaIn);
});

test("explicit property schema, missing name", () => {
  const schema = [{}];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("name")], actual: schema[0], path: [0] }
  );
});

test("explicit property schema, missing value", () => {
  const schema = [{ name: "name" }];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("value")], actual: schema[0], path: [0] }
  );
});

test("explicit property schema, mistyped name", () => {
  const schema = [{ name: 1, value: "value" }];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0].name, path: [0, "name"] }
  );
});

test("explicit property schema, mistyped value", () => {
  const schema = [{ name: "name", value: null }];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { actual: schema[0].value, path: [0, "value"] }
  );
});

test("array property schema, not enough elements", () => {
  const schema = [[]];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [2, 3], actual: schema[0].length, path: [0, "length"] }
  );
});

test("array property schema, too much elements", () => {
  const schema = [[1, 2, 3, 4]];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [2, 3], actual: schema[0].length, path: [0, "length"] }
  );
});

test("array property schema, mistyped name", () => {
  const schema = [[1, "length"]];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0][0], path: [0, 0] }
  );
});

test("array property schema, mistyped length", () => {
  const schema = [["name", 1]];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0][1], path: [0, 1] }
  );
});

test("array property schema, mistyped item schema", () => {
  const schema = [["name", "length", null]];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { actual: schema[0][2], path: [0, 2] }
  );
});

test("implicit object schema, mistyped property schema", () => {
  const schema = [null];
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["object", "array", "string"], actual: schema[0], path: [0] }
  );
});

test("explicit object schema, missing properties", () => {
  const schema = { type: "object" };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("properties")], actual: schema, path: [] }
  );
});

test("explicit object schema, mistyped properties", () => {
  const schema = { type: "object", properties: null };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["array"], actual: schema.properties, path: ["properties"] }
  );
});

test("explicit object schema, mistyped property schema", () => {
  const schema = { type: "object", properties: [null] };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", "string"],
      actual: schema.properties[0],
      path: ["properties", 0],
    }
  );
});

test("array schema, mistyped length", () => {
  const schema = { length: 1 };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema.length, path: ["length"] }
  );
});

test("array schema, misvalued type", () => {
  const schema = { length: "length", type: "not a type" };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ['"number"', '"string"', '"array"'],
      actual: schema.type,
      path: ["type"],
    }
  );
});

test("array schema, mistyped item schema", () => {
  const schema = { length: "length", type: "string", items: null };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema.items,
      path: ["items"],
    }
  );
});

test("unknown record-like schema, misvalued type", () => {
  const schema = { type: "not a type" };
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ['"string"', '"number"'],
      actual: schema.type,
      path: ["type"],
    }
  );
});

test("unknown record-like schema, no type and no length", () => {
  const schema = {};
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: [expectProperty("type"), expectProperty("length")],
      actual: schema,
      path: [],
    }
  );
});

test("unknown schema", () => {
  const schema = null;
  assert.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema,
      path: [],
    }
  );
});
