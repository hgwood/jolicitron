import {
  Schema,
  ObjectSchema,
  PropertySchema,
  ArraySchema,
  StringSchema,
  NumberSchema
} from "./compile";

export const normalize = (shortSchema: ShortSchema): Schema => {
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
  shortObjectSchema: ShortObjectSchema
): ObjectSchema => {
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
  shortPropertySchema: ShortPropertySchema
): PropertySchema => {
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

const normalizeArray = (shortArraySchema: ShortArraySchema): ArraySchema => {
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
            | ShortNumberSchema
            | StringSchema)
    });
  } else {
    return {
      type: "array",
      length: shortArraySchema.length,
      items: normalize(shortArraySchema.items || {})
    };
  }
};

export type ShortSchema =
  | ShortObjectSchema
  | ShortArraySchema
  | ShortNumberSchema
  | StringSchema
  | "number"
  | "string";

export type ShortObjectSchema =
  | {
      type: "object";
      properties: ShortPropertySchema[];
    }
  | ShortPropertySchema[];

export type ShortPropertySchema =
  | { name: string; value: ShortSchema }
  | string
  | [string, string]
  | [string, string, ShortSchema];

export type ShortArraySchema = {
  length: ArraySchema["length"];
  type?: "number" | "string" | "array";
  items?: ShortSchema;
};

export type ShortNumberSchema = Partial<NumberSchema>;
