import {
  NormalSchema,
  NormalObjectSchema,
  NormalPropertySchema,
  NormalArraySchema,
  NormalStringSchema,
  NormalNumberSchema
} from "./compile";

export const normalize = (shortSchema: Schema): NormalSchema => {
  if (typeof shortSchema === "string") {
    return { type: shortSchema };
  } else if (Array.isArray(shortSchema) || shortSchema.type === "object") {
    return normalizeObject(shortSchema);
  } else if ("length" in shortSchema) {
    return normalizeArray(shortSchema);
  } else if (!shortSchema.type) {
    return { type: "number" };
  } else {
    return { type: shortSchema.type };
  }
};

const normalizeObject = (
  shortObjectSchema: ObjectSchema
): NormalObjectSchema => {
  if (Array.isArray(shortObjectSchema)) {
    return normalizeObject({
      type: "object",
      properties: shortObjectSchema
    });
  } else {
    return {
      type: "object",
      properties: shortObjectSchema.properties.map(normalizeProperty)
    };
  }
};

const normalizeProperty = (
  shortPropertySchema: PropertySchema
): NormalPropertySchema => {
  if (typeof shortPropertySchema === "string") {
    return { name: shortPropertySchema, value: normalize({}) };
  } else if (Array.isArray(shortPropertySchema)) {
    const [propertyName, length, itemSchema] = shortPropertySchema;
    return {
      name: propertyName,
      value: {
        type: "array",
        length,
        items: normalize(itemSchema || {})
      }
    };
  } else {
    const { name, value } = shortPropertySchema;
    return { name, value: normalize(value) };
  }
};

const normalizeArray = (
  shortArraySchema: ArraySchema
): NormalArraySchema => {
  if (shortArraySchema.type !== "array") {
    return normalizeArray({
      type: "array",
      length: shortArraySchema.length,
      items: shortArraySchema.items
        ? normalize(shortArraySchema.items)
        : // TypeScript seems unable to select the subset of ShortSchema
          // that is correct here. It selects ShortArraySchema instead of
          // ShortNumberParserDefiniton | StringSchema. Hence the cast.
          normalize({ type: shortArraySchema.type } as
            | NumberSchema
            | NormalStringSchema)
    });
  } else {
    return {
      type: "array",
      length: shortArraySchema.length,
      items: normalize(shortArraySchema.items || {})
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
