import { Schema, PropertySchema } from "./normalize";

export function parseSchema(schema: unknown): Schema {
  return parseChildSchema(schema, { path: [] });
}

function parseChildSchema(schema: unknown, { path }: { path: Path }): Schema {
  if (schema === "string" || schema === "number") {
    return schema;
  } else if (Array.isArray(schema)) {
    return schema.map((propertySchema, index) =>
      parsePropertySchema(propertySchema, { path: [...path, index] })
    );
  } else if (typeof schema === "object" && schema !== null) {
    if (hasKeys(schema, ["length"]) && typeof schema.length === "string") {
      const length = schema.length;
      const items = hasKeys(schema, ["items"])
        ? {
            items: parseChildSchema(schema.items, { path: [...path, "items"] })
          }
        : {};
      const type =
        hasKeys(schema, ["type"]) &&
        (schema.type === "number" ||
          schema.type === "string" ||
          schema.type === "array")
          ? ({ type: schema.type } as const)
          : {};
      return { length, ...items, ...type };
    } else if (hasKeys(schema, ["type"])) {
      // WORKAROUND: cannot use || here because otherwise TypeScript infers
      // that the return type is ArraySchema and requires 'length' to be present
      if (schema.type === "number") {
        return { type: schema.type };
      } else if (schema.type === "string") {
        return { type: schema.type };
      } else if (
        schema.type === "object" &&
        hasKeys(schema, ["properties"]) &&
        Array.isArray(schema.properties)
      ) {
        return {
          type: "object",
          properties: schema.properties.map((propertySchema, index) =>
            parsePropertySchema(propertySchema, { path: [...path, index] })
          )
        };
      } else {
        throw new TypeError(
          `expected { type: "string" } or { type: "number" } or { type: "object", properties: array } but found '${JSON.stringify(
            schema
          )}' at '${pathToString(path)}'`
        );
      }
    } else {
      return {};
    }
  } else {
    throw new TypeError(
      `expected "string" or "number" or array or object but found '${JSON.stringify(
        schema
      )} at '${pathToString(path)}'`
    );
  }
}

function parsePropertySchema(
  propertySchema: unknown,
  { path }: { path: Path }
): PropertySchema {
  if (typeof propertySchema === "string") {
    return propertySchema;
  } else if (Array.isArray(propertySchema)) {
    const [name, length, itemSchema] = propertySchema as unknown[];
    if (
      propertySchema.length === 2 &&
      typeof name === "string" &&
      typeof length === "string"
    ) {
      return [name, length];
    } else if (
      propertySchema.length === 3 &&
      typeof name === "string" &&
      typeof length === "string"
    ) {
      return [
        name,
        length,
        parseChildSchema(itemSchema, { path: [...path, 2] })
      ];
    } else {
      throw new TypeError(
        `expected array to be a pair of strings or a pair strings followed by a schema but found '${JSON.stringify(
          propertySchema
        )}' at '${pathToString(path)}'`
      );
    }
  } else if (
    typeof propertySchema === "object" &&
    propertySchema !== null &&
    hasKeys(propertySchema, ["name", "value"]) &&
    typeof propertySchema.name === "string"
  ) {
    return {
      name: propertySchema.name,
      value: parseChildSchema(propertySchema.value, {
        path: [...path, "value"]
      })
    };
  } else {
    throw new TypeError(
      `expected string or array or { name: string, value: Schema } but found '${JSON.stringify(
        propertySchema
      )}' at '${pathToString(path)}'`
    );
  }
}

function hasKeys<Key extends string>(
  obj: object,
  keys: Key[]
): obj is { [K in Key]: unknown } {
  return keys.every(key => key in obj);
}

type Path = Array<string | number>;

function pathToString(path: Path) {
  return "$." + path.join(".");
}
