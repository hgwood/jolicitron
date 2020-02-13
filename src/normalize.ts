import {
  ParserDefinition,
  ObjectParserDefinition,
  PropertyParserDefinition,
  ArrayParserDefinition,
  StringParserDefinition,
  NumberParserDefinition
} from "./compiler";

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
    return { [shortPropertyParserDefinition]: normalize({}) };
  } else if (Array.isArray(shortPropertyParserDefinition)) {
    const [
      propertyName,
      length,
      itemParserDefinition
    ] = shortPropertyParserDefinition;
    return {
      [propertyName]: {
        type: "array",
        length,
        items: normalize(itemParserDefinition || {})
      }
    };
  } else {
    const [[propertyName, parserDefinition]] = Object.entries(
      shortPropertyParserDefinition
    );
    return { [propertyName]: normalize(parserDefinition) };
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
        : // TypeScript seems unable to select the subset ShortParserDefinition
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
  | { [key: string]: ShortParserDefinition }
  | string
  | [string, string]
  | [string, string, ShortParserDefinition];

export type ShortArrayParserDefinition = {
  length: ArrayParserDefinition["length"];
  type?: "number" | "string" | "array";
  items?: ShortParserDefinition;
};

export type ShortNumberParserDefinition = Partial<NumberParserDefinition>;
