import {
  NormalSchema,
  NormalObjectSchema,
  NormalPropertySchema,
  NormalArraySchema,
  NormalStringSchema,
} from "./compile";

export const normalize = (schema: Schema): NormalSchema => {
  if (schema === "number" || schema === "string") {
    return { type: schema };
  } else if (Array.isArray(schema) || schema.type === "object") {
    return normalizeObjectSchema(schema);
  } else if ("length" in schema) {
    return normalizeArraySchema(schema);
  } else {
    return { type: schema.type };
  }
};

const normalizeObjectSchema = (schema: ObjectSchema): NormalObjectSchema => {
  if (Array.isArray(schema)) {
    return normalizeObjectSchema({
      type: "object",
      properties: schema,
    });
  } else {
    return {
      type: "object",
      properties: schema.properties.map(normalizePropertySchema),
    };
  }
};

const normalizePropertySchema = (
  schema: PropertySchema
): NormalPropertySchema => {
  if (typeof schema === "string") {
    return { name: schema, value: normalize("number") };
  } else if (Array.isArray(schema)) {
    const [propertyName, length, itemSchema] = schema;
    return {
      name: propertyName,
      value: {
        type: "array",
        length,
        items: normalize(itemSchema || "number"),
      },
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
          normalize({ type: schema.type } as NumberSchema | NormalStringSchema),
    });
  } else {
    return {
      type: "array",
      length: schema.length,
      items: normalize(schema.items || "number"),
    };
  }
};

export type Schema = ObjectSchema | ArraySchema | NumberSchema | StringSchema;

export type ObjectSchema = ExplicitObjectSchema | ImplicitObjectSchema;

export type ExplicitObjectSchema = {
  type: "object";
  properties: PropertySchema[];
};

export type ImplicitObjectSchema = PropertySchema[];

export type PropertySchema =
  | ExplicitPropertySchema
  | NumberPropertySchema
  | ArrayPropertySchema;

export type ExplicitPropertySchema = {
  name: string;
  value: Schema;
};

export type NumberPropertySchema = string;

export type ArrayPropertySchema =
  | ArrayOfNumberPropertySchema
  | ExplicitArrayPropertySchema;

export type ArrayOfNumberPropertySchema = [string, string];

export type ExplicitArrayPropertySchema = [string, string, Schema];

export type ArraySchema = {
  length: string;
  // FIXME: the following two lines allow for contradicting 'type' and 'items'
  // eg { length: "length", type: "number", items: "string" }
  type?: "number" | "string" | "array";
  items?: Schema;
};

export type NumberSchema = ExplicitNumberSchema | ShortNumberSchema;

export type ExplicitNumberSchema = { type: "number" };

export type ShortNumberSchema = "number";

export type StringSchema = ExplicitStringSchema | ShortStringSchema;

export type ExplicitStringSchema = { type: "string" };

export type ShortStringSchema = "string";
