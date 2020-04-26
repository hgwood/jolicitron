import {
  Schema,
  PropertySchema,
  ArraySchema,
  ExplicitPropertySchema,
  ArrayPropertySchema,
  ExplicitObjectSchema,
  ImplicitObjectSchema,
  ExplicitNumberSchema,
  ExplicitStringSchema
} from "./normalize";
import { NormalSchema } from "./compile";

/**
 * Cannot use type guard because no type-checking inside
 * Cannot use type assert because no type-checking inside
 * => Must return value with more narrow type
 *
 * TypeScript 3.8 does not support narrowing an object (or array) type based
 * on guards on its properties (or elements).
 * => Must return copies or objects and arrays
 */

export function isSchema(schema: unknown): schema is Schema {
  try {
    typecheckSchema(schema);
    return true;
  } catch (err) {
    return false;
  }
}

export function typecheckSchema(schema: unknown): Schema {
  try {
    return typecheckSchemaAt(schema, at(schema));
  } catch (err) {
    throw new TypeError(buildErrorMessage(err));
  }
}

function typecheckSchemaAt(schema: unknown, location: Location): Schema {
  if (isArray(schema)) {
    return typecheckImplicitObjectSchemaAt(schema, location);
  } else if (isRecord(schema)) {
    if (hasTypeProperty(schema, "object")) {
      return typecheckExplicitObjectSchemaAt(schema, location);
    } else if (hasProperty(schema, "length")) {
      return typecheckArraySchemaAt(schema, location);
    } else if (hasProperty(schema, "type")) {
      return typecheckExplicitNumberOrExplicitStringSchemaAt(schema, location);
    } else {
      throw error({
        expected: ["a 'type' property", "a 'length' property"],
        actual: schema,
        location
      });
    }
  } else if (schema === "number" || schema === "string") {
    return schema;
  } else {
    throw error({
      expected: ["object", "array", '"number"', '"string"'],
      actual: schema,
      location
    });
  }
}

function typecheckExplicitNumberOrExplicitStringSchemaAt(
  schema: { type: unknown },
  location: Location
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
      location: push(location, "type")
    });
  }
}

function typecheckArraySchemaAt(
  schema: { length: unknown },
  location: Location
): ArraySchema {
  const { length } = schema;
  if (typeof length !== "string") {
    throw error({
      expected: ["string"],
      actual: length,
      location: push(location, "length")
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
        location: push(location, "type")
      });
    }
  }
  if (hasProperty(schema, "items")) {
    result.items = typecheckSchemaAt(schema.items, push(location, "items"));
  }
  return result;
}

function typecheckImplicitObjectSchemaAt(
  schema: unknown[],
  location: Location
): ImplicitObjectSchema {
  return schema.map((property, index) =>
    typecheckPropertySchemaAt(property, push(location, index))
  );
}

function typecheckExplicitObjectSchemaAt(
  schema: { type: "object" },
  location: Location
): ExplicitObjectSchema {
  if (!hasProperty(schema, "properties")) {
    throw error({
      expected: ["a property 'properties'"],
      actual: schema,
      location
    });
  }
  const { properties } = schema;
  if (!isArray(properties)) {
    throw error({
      expected: ["array"],
      actual: properties,
      location: push(location, "properties")
    });
  } else {
    return {
      type: schema.type,
      properties: properties.map((property, index) =>
        typecheckPropertySchemaAt(property, push(location, index))
      )
    };
  }
}

function typecheckPropertySchemaAt(
  schema: unknown,
  location: Location
): PropertySchema {
  if (isRecord(schema)) {
    return typecheckExplicitPropertySchemaAt(schema, location);
  } else if (isArray(schema)) {
    return typecheckArrayPropertySchemaAt(schema, location);
  } else if (typeof schema === "string") {
    return schema;
  } else {
    throw error({
      expected: ["object", "array", "string"],
      actual: schema,
      location
    });
  }
}

function typecheckExplicitPropertySchemaAt(
  schema: object,
  location: Location
): ExplicitPropertySchema {
  if (!hasProperty(schema, "name")) {
    throw error({ expected: ["a property 'name'"], actual: schema, location });
  }
  if (!hasProperty(schema, "value")) {
    throw error({ expected: ["a property 'value'"], actual: schema, location });
  }
  const { name, value } = schema;
  if (typeof name !== "string") {
    throw error({
      expected: ["string"],
      actual: name,
      location: push(location, "name")
    });
  }
  return {
    name,
    value: typecheckSchemaAt(value, push(location, "value"))
  };
}

function typecheckArrayPropertySchemaAt(
  schema: unknown[],
  location: Location
): ArrayPropertySchema {
  if (schema.length < 2 || schema.length > 3) {
    throw error({
      expected: [2, 3],
      actual: schema.length,
      location: push(location, "length")
    });
  }
  const [name, length] = schema;
  if (typeof name !== "string") {
    throw error({
      expected: ["string"],
      actual: name,
      location: push(location, 0)
    });
  }
  if (typeof length !== "string") {
    throw error({
      expected: ["string"],
      actual: length,
      location: push(location, 1)
    });
  }
  if (schema.length === 2) {
    return [name, length];
  }
  const itemSchema = typecheckSchemaAt(schema[2], push(location, 2));
  return [name, length, itemSchema];
}

// NOTE: seems redundant but actually useful because
// Array.isArray casts to any[] while this casts to unknown[]
// which is safer.
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isRecord(value: unknown): value is object {
  return typeof value === "object" && value !== null && !isArray(value);
}

function hasProperty<Key extends string>(
  value: object,
  key: Key
): value is { [K in Key]: unknown } {
  return key in value;
}

function hasTypeProperty<TypeValue extends NormalSchema["type"]>(
  value: object,
  type: TypeValue
): value is { type: TypeValue } {
  return hasProperty(value, "type") && value.type === type;
}

type PathSegment = string | number;

type Path = PathSegment[];

type Location = {
  root: any;
  path: Path;
};

type TypeCheckingError = {
  expected: unknown[];
  actual: unknown;
  location: Location;
};

function at(root: any): Location {
  return { root, path: [] };
}

function push({ root, path }: Location, pathSegment: PathSegment) {
  return {
    root,
    path: [...path, pathSegment]
  };
}

/**
 * This only exists for type-checking.
 */
function error(error: TypeCheckingError): TypeCheckingError {
  return error;
}

function buildErrorMessage({
  expected,
  actual,
  location: { root, path }
}: TypeCheckingError) {
  const stack = buildStack(root, path);
  const stringifiedExpected = expected.join(" or ");
  const stringifiedActual = JSON.stringify(actual, null, 2);
  return [
    `expected ${stringifiedExpected} but found '${stringifiedActual}'`,
    ...stack
  ].join("\n");
}

function buildStack(root: any, path: Path) {
  const stack = [];
  const stackPath: Path = [];
  while (path.length > 0) {
    stackPath.unshift(path.pop()!);
    const stringifiedPath = pathToString([...stackPath]);
    const stringifiedValue = JSON.stringify(
      getAtPath(root, [...path]),
      null,
      2
    );
    stack.push(`at ${stringifiedPath} in '${stringifiedValue}'`);
  }
  return stack;
}

function getAtPath(root: any, path: Path) {
  return path.reduce((acc, e) => {
    return acc[e];
  }, root);
}

function pathToString(path: Path) {
  const stringSegments = path.map(segment =>
    typeof segment === "number" ? `[${segment}]` : `.${segment}`
  );
  return ["$", ...stringSegments].join("");
}
