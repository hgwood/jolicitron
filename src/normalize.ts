import {
  ParserDefinition,
  ObjectParserDefinition,
  PropertyParserDefinition,
  ArrayParserDefinition,
  StringParserDefinition,
  NumberParserDefinition
} from "./compile";

export const normalize = (
  shortParserDefinition: ShortParserDefinition
): ParserDefinition => {
  if (typeof shortParserDefinition === "string") {
    return { type: shortParserDefinition };
  } else if (
    Array.isArray(shortParserDefinition) ||
    shortParserDefinition.type === "object"
  ) {
    return normalizeObject(shortParserDefinition);
  } else if ("length" in shortParserDefinition) {
    return normalizeArray(shortParserDefinition);
  } else if (!shortParserDefinition.type) {
    return { type: "number" };
  } else {
    return { type: shortParserDefinition.type };
  }
};

const normalizeObject = (
  shortObjectParserDefinition: ShortObjectParserDefinition
): ObjectParserDefinition => {
  if (Array.isArray(shortObjectParserDefinition)) {
    return normalizeObject({
      type: "object",
      properties: shortObjectParserDefinition
    });
  } else {
    return {
      type: "object",
      properties: shortObjectParserDefinition.properties.map(normalizeProperty)
    };
  }
};

const normalizeProperty = (
  shortPropertyParserDefinition: ShortPropertyParserDefinition
): PropertyParserDefinition => {
  if (typeof shortPropertyParserDefinition === "string") {
    return { name: shortPropertyParserDefinition, value: normalize({}) };
  } else if (Array.isArray(shortPropertyParserDefinition)) {
    const [
      propertyName,
      length,
      itemParserDefinition
    ] = shortPropertyParserDefinition;
    return {
      name: propertyName,
      value: {
        type: "array",
        length,
        items: normalize(itemParserDefinition || {})
      }
    };
  } else {
    const { name, value } = shortPropertyParserDefinition;
    return { name, value: normalize(value) };
  }
};

const normalizeArray = (
  shortArrayParserDefinition: ShortArrayParserDefinition
): ArrayParserDefinition => {
  if (shortArrayParserDefinition.type !== "array") {
    return normalizeArray({
      type: "array",
      length: shortArrayParserDefinition.length,
      items: shortArrayParserDefinition.items
        ? normalize(shortArrayParserDefinition.items)
        : // TypeScript seems unable to select the subset of ShortParserDefinition
          // that is correct here. It selects ShortArrayParserDefinition instead of
          // ShortNumberParserDefiniton | StringParserDefinition. Hence the cast.
          normalize({ type: shortArrayParserDefinition.type } as
            | ShortNumberParserDefinition
            | StringParserDefinition)
    });
  } else {
    return {
      type: "array",
      length: shortArrayParserDefinition.length,
      items: normalize(shortArrayParserDefinition.items || {})
    };
  }
};

export type ShortParserDefinition =
  | ShortObjectParserDefinition
  | ShortArrayParserDefinition
  | ShortNumberParserDefinition
  | StringParserDefinition
  | "number"
  | "string";

export type ShortObjectParserDefinition =
  | {
      type: "object";
      properties: ShortPropertyParserDefinition[];
    }
  | ShortPropertyParserDefinition[];

export type ShortPropertyParserDefinition =
  | { name: string; value: ShortParserDefinition }
  | string
  | [string, string]
  | [string, string, ShortParserDefinition];

export type ShortArrayParserDefinition = {
  length: ArrayParserDefinition["length"];
  type?: "number" | "string" | "array";
  items?: ShortParserDefinition;
};

export type ShortNumberParserDefinition = Partial<NumberParserDefinition>;
