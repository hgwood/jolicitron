export const jolicitron = (
  parserDefinition: ShortParserDefinition,
  input: string
) => {
  const normalized = normalize(parserDefinition);
  const parser = compile(normalized);
  const tokens = tokenize(input);
  const { value } = parser(tokens);
  return value;
};

export default jolicitron;

export const compile = (
  parserDefinition: ParserDefinition
): Parser<unknown> => {
  switch (parserDefinition.type) {
    case "object":
      return compileObject(parserDefinition);
    case "array":
      return compileArray(parserDefinition);
    case "number":
      return compileNumber(parserDefinition);
    case "string":
      return compileString(parserDefinition);
  }
};

export const compileObject = ({
  properties
}: ObjectParserDefinition): Parser<unknown> => {
  return (tokens, context = {}) => {
    return properties.reduce(
      (objectParserResult, propertyParserDefinition) => {
        const [[propertyName, parserDefinition]] = Object.entries(
          propertyParserDefinition
        );
        const propertyParser = compile(parserDefinition);
        const propertyParserResult = propertyParser(
          objectParserResult.remaining,
          objectParserResult.context
        );
        return {
          value: {
            ...objectParserResult.value,
            [propertyName]: propertyParserResult.value
          },
          remaining: propertyParserResult.remaining,
          context: {
            ...objectParserResult.context,
            [propertyName]: propertyParserResult.value
          }
        };
      },
      { value: {}, remaining: tokens, context }
    );
  };
};

export const compileArray = ({
  length,
  items
}: ArrayParserDefinition): Parser<unknown[]> => {
  return (tokens, context = {}) => {
    const lengthValue = Number(context?.[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context?.[length]}'`
      );
    }
    return times(lengthValue).reduce(
      arrayParserResult => {
        const itemParser = compile(items);
        const itemParserResult = itemParser(
          arrayParserResult.remaining,
          context
        );
        return {
          ...itemParserResult,
          value: [...arrayParserResult.value, itemParserResult.value]
        };
      },
      {
        value: [],
        remaining: tokens,
        context
      } as ParserResult<unknown[]>
    );
  };
};

export const compileNumber = (
  parserDefinition: NumberParserDefinition
): Parser<number> => {
  return (tokens, context = {}) => {
    const [nextToken, ...remaining] = tokens;
    const value = Number(nextToken);
    if (Number.isNaN(value)) {
      throw new RangeError(`expected number but found '${value}'`);
    }
    return {
      value,
      remaining,
      context
    };
  };
};

export const compileString = (
  parserDefinition: StringParserDefinition
): Parser<string> => {
  return (tokens, context = {}) => {
    const [nextToken, ...remaining] = tokens;
    return {
      value: nextToken,
      remaining,
      context
    };
  };
};

export const tokenize = (input: string) => {
  return input.split(/\s+/).filter(Boolean);
};

export type ParserDefinition =
  | ObjectParserDefinition
  | ArrayParserDefinition
  | NumberParserDefinition
  | StringParserDefinition;

export type ObjectParserDefinition = {
  type: "object";
  properties: PropertyParserDefinition[];
};

export type PropertyParserDefinition = { [key: string]: ParserDefinition };

export type ArrayParserDefinition = {
  type: "array";
  length: string;
  items: ParserDefinition;
};

export type NumberParserDefinition = {
  type: "number";
};

export type StringParserDefinition = {
  type: "string";
};

type Parser<T> = (tokens: string[], context?: Context) => ParserResult<T>;

type Context = { [key: string]: unknown };

type ParserResult<T> = { value: T; remaining: string[]; context?: Context };

export const normalize = (
  shortParserDefinition: ShortParserDefinition
): ParserDefinition => {
  if (
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
  | StringParserDefinition;

type ShortObjectParserDefinition =
  | {
      type: "object";
      properties: ShortPropertyParserDefinition[];
    }
  | ShortPropertyParserDefinition[];

type ShortPropertyParserDefinition =
  | { [key: string]: ShortParserDefinition }
  | string
  | [string, string]
  | [string, string, ShortParserDefinition];

type ShortArrayParserDefinition = {
  length: ArrayParserDefinition["length"];
  type?: "number" | "string" | "array";
  items?: ShortParserDefinition;
};

type ShortNumberParserDefinition = Partial<NumberParserDefinition>;

const times = (n: number) => Array.from({ length: n } as ArrayLike<number>);
