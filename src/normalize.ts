import {
  NormalSchema,
  NormalObjectSchema,
  NormalPropertySchema,
  NormalArraySchema,
  NormalStringSchema,
  NormalNumberSchema
} from "./compile";

export const normalize = (schema: Schema): NormalSchema => {
  if (typeof schema === "string") {
    return { type: schema };
  } else if (Array.isArray(schema) || schema.type === "object") {
    return normalizeObject(schema);
  } else if ("length" in schema) {
    return normalizeArray(schema);
  } else if (!schema.type) {
    return { type: "number" };
  } else {
    return { type: schema.type };
  }
};

const normalizeObject = (schema: ObjectSchema): NormalObjectSchema => {
  if (Array.isArray(schema)) {
    return normalizeObject({
      type: "object",
      properties: schema
    });
  } else {
    return {
      type: "object",
      properties: schema.properties.map(normalizeProperty)
    };
  }
};

const normalizeProperty = (schema: PropertySchema): NormalPropertySchema => {
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

const normalizeArray = (schema: ArraySchema): NormalArraySchema => {
  if (schema.type !== "array") {
    return normalizeArray({
      type: "array",
      length: schema.length,
      items: schema.items
        ? normalize(schema.items)
        : // TypeScript seems unable to select the subset of ShortSchema
          // that is correct here. It selects ShortArraySchema instead of
          // ShortNumberParserDefiniton | StringSchema. Hence the cast.
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

export type Schema =
  | ObjectSchema
  | ArraySchema
  | NumberSchema
  | NormalStringSchema
  | "number"
  | "string";

export type ObjectSchema =
  | {
      type: "object";
      properties: PropertySchema[];
    }
  | PropertySchema[];

export type PropertySchema =
  | { name: string; value: Schema }
  | string
  | [string, string]
  | [string, string, Schema];

export type ArraySchema = {
  length: NormalArraySchema["length"];
  type?: "number" | "string" | "array";
  items?: Schema;
};

export type NumberSchema = Partial<NormalNumberSchema>;
