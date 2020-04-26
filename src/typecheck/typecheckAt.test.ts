import { test } from "tap";
import { typecheckSchemaAt, expectProperty } from "./typecheckAt";

test("valid schema with all combinations of valid schemas", t => {
  const schemaIn = {
    // explicit object schema
    type: "object",
    properties: [
      // explicit property schema
      {
        name: "property1",
        value: "number"
      },
      // number property
      "property2",
      // array of number property
      ["property3", "length3"],
      // explicit array property
      ["property4", "length4", "number"],

      {
        name: "property5",
        // implicit object schema, empty
        value: []
      },
      {
        name: "property6",
        // implicit object schema, not empty
        value: ["subproperty1", "subproperty2"]
      },
      {
        name: "property7",
        value: { length: "length7" }
      },
      { name: "property8", value: { length: "length8", type: "number" } },
      { name: "property9", value: { length: "length8", type: "string" } },
      { name: "property11", value: { length: "length8", type: "array" } },
      {
        name: "property12",
        value: { length: "length8", type: "array", items: "number" }
      },
      { name: "property13", value: { length: "length8", items: "number" } },
      { name: "property14", value: { type: "number" } },
      { name: "property15", value: { type: "string" } }
    ]
  };
  const schemaOut = typecheckSchemaAt(schemaIn, []);
  t.deepEqual(schemaOut, schemaIn);
  t.end();
});

test("explicit property schema, missing name", t => {
  const schema = [{}];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("name")], actual: schema[0], path: [0] }
  );
  t.end();
});

test("explicit property schema, missing value", t => {
  const schema = [{ name: "name" }];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("value")], actual: schema[0], path: [0] }
  );
  t.end();
});

test("explicit property schema, mistyped name", t => {
  const schema = [{ name: 1, value: "value" }];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0].name, path: [0, "name"] }
  );
  t.end();
});

test("explicit property schema, mistyped value", t => {
  const schema = [{ name: "name", value: null }];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { actual: schema[0].value, path: [0, "value"] }
  );
  t.end();
});

test("array property schema, not enough elements", t => {
  const schema = [[]];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [2, 3], actual: schema[0].length, path: [0, "length"] }
  );
  t.end();
});

test("array property schema, too much elements", t => {
  const schema = [[1, 2, 3, 4]];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [2, 3], actual: schema[0].length, path: [0, "length"] }
  );
  t.end();
});

test("array property schema, mistyped name", t => {
  const schema = [[1, "length"]];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0][0], path: [0, 0] }
  );
  t.end();
});

test("array property schema, mistyped length", t => {
  const schema = [["name", 1]];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema[0][1], path: [0, 1] }
  );
  t.end();
});

test("array property schema, mistyped item schema", t => {
  const schema = [["name", "length", null]];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { actua: schema[0][2], path: [0, 2] }
  );
  t.end();
});

test("implicit object schema, mistyped property schema", t => {
  const schema = [null];
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["object", "array", "string"], actual: schema[0], path: [0] }
  );
  t.end();
});

test("explicit object schema, missing properties", t => {
  const schema = { type: "object" };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: [expectProperty("properties")], actual: schema, path: [] }
  );
  t.end();
});

test("explicit object schema, mistyped properties", t => {
  const schema = { type: "object", properties: null };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["array"], actual: schema.properties, path: ["properties"] }
  );
  t.end();
});

test("explicit object schema, mistyped property schema", t => {
  const schema = { type: "object", properties: [null] };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", "string"],
      actual: schema.properties[0],
      path: ["properties", 0]
    }
  );
  t.end();
});

test("array schema, mistyped length", t => {
  const schema = { length: 1 };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    { expected: ["string"], actual: schema.length, path: ["length"] }
  );
  t.end();
});

test("array schema, misvalued type", t => {
  const schema = { length: "length", type: "not a type" };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ['"number"', '"string"', '"array"'],
      actual: schema.type,
      path: ["type"]
    }
  );
  t.end();
});

test("array schema, mistyped item schema", t => {
  const schema = { length: "length", type: "string", items: null };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema.items,
      path: ["items"]
    }
  );
  t.end();
});

test("unknown record-like schema, misvalued type", t => {
  const schema = { type: "not a type" };
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ['"string"', '"number"'],
      actual: schema.type,
      path: ["type"]
    }
  );
  t.end();
});

test("unknown record-like schema, no type and no length", t => {
  const schema = {};
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: [expectProperty("type"), expectProperty("length")],
      actual: schema,
      path: []
    }
  );
  t.end();
});

test("unknown schema", t => {
  const schema = null;
  t.throws(
    () => {
      typecheckSchemaAt(schema, []);
    },
    {
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema,
      path: []
    }
  );
  t.end();
});
