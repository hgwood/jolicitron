import {
  Schema,
  ExplicitNumberSchema,
  ExplicitStringSchema,
  ArraySchema,
  ImplicitObjectSchema,
  ExplicitObjectSchema,
  PropertySchema,
  ExplicitPropertySchema,
  ArrayPropertySchema
} from "../normalize";
import { isArray, isRecord, hasTypeProperty, hasProperty } from "./guards";
import { error, Path, push } from "./error";

export function typecheckSchemaAt(schema: unknown, path: Path): Schema {
  if (isArray(schema)) {
    return typecheckImplicitObjectSchemaAt(schema, path);
  } else if (isRecord(schema)) {
    if (hasTypeProperty(schema, "object")) {
      return typecheckExplicitObjectSchemaAt(schema, path);
    } else if (hasProperty(schema, "length")) {
      return typecheckArraySchemaAt(schema, path);
    } else if (hasProperty(schema, "type")) {
      return typecheckExplicitNumberOrExplicitStringSchemaAt(schema, path);
    } else {
      throw error({
        expected: ["a 'type' property", "a 'length' property"],
        actual: schema,
        path
      });
    }
  } else if (schema === "number" || schema === "string") {
    return schema;
  } else {
    throw error({
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema,
      path
    });
  }
}

function typecheckExplicitNumberOrExplicitStringSchemaAt(
  schema: { type: unknown },
  path: Path
): ExplicitNumberSchema | ExplicitStringSchema {
  const { type } = schema;
  // NOTE: cannot use || for the next two conditions because otherwise
  // TypeScript 3.8 assumes ArraySchema
  if (type === "string") {
    return { type };
  } else if (type === "number") {
    return { type };
  } else {
    throw error({
      expected: ['"string"', '"number"'],
      actual: schema.type,
      path: push(path, "type")
    });
  }
}

function typecheckArraySchemaAt(
  schema: { length: unknown },
  path: Path
): ArraySchema {
  const { length } = schema;
  if (typeof length !== "string") {
    throw error({
      expected: ["string"],
      actual: length,
      path: push(path, "length")
    });
  }
  const result: ArraySchema = { length };
  if (hasProperty(schema, "type")) {
    if (
      schema.type === "number" ||
      schema.type === "string" ||
      schema.type === "array"
    ) {
      result.type = schema.type;
    } else {
      throw error({
        expected: ["number", "string", "array"],
        actual: schema.type,
        path: push(path, "type")
      });
    }
  }
  if (hasProperty(schema, "items")) {
    result.items = typecheckSchemaAt(schema.items, push(path, "items"));
  }
  return result;
}

function typecheckImplicitObjectSchemaAt(
  schema: unknown[],
  path: Path
): ImplicitObjectSchema {
  return schema.map((property, index) =>
    typecheckPropertySchemaAt(property, push(path, index))
  );
}

function typecheckExplicitObjectSchemaAt(
  schema: { type: "object" },
  path: Path
): ExplicitObjectSchema {
  if (!hasProperty(schema, "properties")) {
    throw error({
      expected: ["a property 'properties'"],
      actual: schema,
      path
    });
  }
  const { properties } = schema;
  if (!isArray(properties)) {
    throw error({
      expected: ["array"],
      actual: properties,
      path: push(path, "properties")
    });
  } else {
    return {
      type: schema.type,
      properties: properties.map((property, index) =>
        typecheckPropertySchemaAt(property, push(path, index))
      )
    };
  }
}

function typecheckPropertySchemaAt(
  schema: unknown,
  path: Path
): PropertySchema {
  if (isRecord(schema)) {
    return typecheckExplicitPropertySchemaAt(schema, path);
  } else if (isArray(schema)) {
    return typecheckArrayPropertySchemaAt(schema, path);
  } else if (typeof schema === "string") {
    return schema;
  } else {
    throw error({
      expected: ["object", "array", "string"],
      actual: schema,
      path
    });
  }
}

function typecheckExplicitPropertySchemaAt(
  schema: object,
  path: Path
): ExplicitPropertySchema {
  if (!hasProperty(schema, "name")) {
    throw error({ expected: ["a property 'name'"], actual: schema, path });
  }
  if (!hasProperty(schema, "value")) {
    throw error({ expected: ["a property 'value'"], actual: schema, path });
  }
  const { name, value } = schema;
  if (typeof name !== "string") {
    throw error({
      expected: ["string"],
      actual: name,
      path: push(path, "name")
    });
  }
  return {
    name,
    value: typecheckSchemaAt(value, push(path, "value"))
  };
}

function typecheckArrayPropertySchemaAt(
  schema: unknown[],
  path: Path
): ArrayPropertySchema {
  if (schema.length < 2 || schema.length > 3) {
    throw error({
      expected: [2, 3],
      actual: schema.length,
      path: push(path, "length")
    });
  }
  const [name, length] = schema;
  if (typeof name !== "string") {
    throw error({
      expected: ["string"],
      actual: name,
      path: push(path, 0)
    });
  }
  if (typeof length !== "string") {
    throw error({
      expected: ["string"],
      actual: length,
      path: push(path, 1)
    });
  }
  if (schema.length === 2) {
    return [name, length];
  }
  const itemSchema = typecheckSchemaAt(schema[2], push(path, 2));
  return [name, length, itemSchema];
}
