import {
  NormalSchema,
  NormalObjectSchema,
  NormalPropertySchema,
  NormalArraySchema,
  NormalStringSchema
} from "./compile";

export const normalize = (schema: Schema): NormalSchema => {
  if (typeof schema === "string") {
    return { type: schema };
  } else if (Array.isArray(schema) || schema.type === "object") {
    return normalizeObjectSchema(schema);
  } else if ("length" in schema) {
    return normalizeArraySchema(schema);
  } else if (!schema.type) {
    return { type: "number" };
  } else {
    return { type: schema.type };
  }
};

const normalizeObjectSchema = (schema: ObjectSchema): NormalObjectSchema => {
  if (Array.isArray(schema)) {
    return normalizeObjectSchema({
      type: "object",
      properties: schema
    });
  } else {
    return {
      type: "object",
      properties: schema.properties.map(normalizePropertySchema)
    };
  }
};

const normalizePropertySchema = (
  schema: PropertySchema
): NormalPropertySchema => {
  if (typeof schema === "string") {
    return { name: schema, value: normalize({}) };
  } else if (Array.isArray(schema)) {
    const [propertyName, length, itemSchema] = schema;
    return {
      name: propertyName,
      value: {
        type: "array",
        length,
        items: normalize(itemSchema || {})
      }
    };
  } else {
    const { name, value } = schema;
    return { name, value: normalize(value) };
  }
};

const normalizeArraySchema = (schema: ArraySchema): NormalArraySchema => {
  if (schema.type !== "array") {
    return normalizeArraySchema({
      type: "array",
      length: schema.length,
      items: schema.items
        ? normalize(schema.items)
        : // TypeScript seems unable to select the subset of Schema
          // that is correct here. It selects ArraySchema instead of
          // NumberSchema | NormalStringSchema. Hence the cast.
          normalize({ type: schema.type } as NumberSchema | NormalStringSchema)
    });
  } else {
    return {
      type: "array",
      length: schema.length,
      items: normalize(schema.items || {})
    };
  }
};

export type Schema = ObjectSchema | ArraySchema | NumberSchema | StringSchema;

export type ObjectSchema =
  | {
      type: "object";
      properties: PropertySchema[];
    }
  | PropertySchema[];

export type PropertySchema =
  | ExplicitPropertySchema
  | NumberPropertySchema
  | ArrayOfNumberPropertySchema
  | ArrayPropertySchema;

type ExplicitPropertySchema = {
  name: string;
  value: Schema;
};

type NumberPropertySchema = string;

type ArrayOfNumberPropertySchema = [string, string];

type ArrayPropertySchema = [string, string, Schema];

export type ArraySchema = {
  length: string;
  type?: "number" | "string" | "array";
  items?: Schema;
};

export type NumberSchema =
  | {
      type?: "number";
    }
  | "number";

type StringSchema = { type: "string" } | "string";
