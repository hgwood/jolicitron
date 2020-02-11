export const jolicitron = (
  parserDefinition: ParserDefinition,
  input: string
) => {
  const parser = compile(parserDefinition);
  const { value } = parser(input);
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
  return (input, context = {}) => {
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
      { value: {}, remaining: input, context }
    );
  };
};

export const compileArray = ({
  length,
  items
}: ArrayParserDefinition): Parser<unknown[]> => {
  return (input, context = {}) => {
    const lengthValue = Number(context?.[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context?.[length]}'`
      );
    }
    return Array.from({ length: lengthValue } as ArrayLike<number>).reduce(
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
        remaining: input,
        context
      } as ParserResult<unknown[]>
    );
  };
};

export const compileNumber = (
  parserDefinition: NumberParserDefinition
): Parser<number> => {
  return (input, context = {}) => {
    const [nextToken, ...remainingTokens] = input.split(/\s+/).filter(Boolean);
    const value = Number(nextToken);
    if (Number.isNaN(value)) {
      throw new RangeError(`expected number but found '${value}'`);
    }
    return {
      value,
      remaining: remainingTokens.join(" "),
      context
    };
  };
};

export const compileString = (
  parserDefinition: StringParserDefinition
): Parser<string> => {
  return (input, context = {}) => {
    const [nextToken, ...remainingTokens] = input.split(/\s+/).filter(Boolean);
    return {
      value: nextToken,
      remaining: remainingTokens.join(" "),
      context
    };
  };
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

type Parser<T> = (input: string, context?: Context) => ParserResult<T>;

type Context = { [key: string]: unknown };

type ParserResult<T> = { value: T; remaining: string; context?: Context };

export const normalize = (
  shortParserDefinition: ShortParserDefinition
): ParserDefinition => {
  if (Array.isArray(shortParserDefinition)) {
    return normalize({
      type: "object",
      properties: shortParserDefinition
    });
  } else if (shortParserDefinition.type === "object") {
    return {
      type: "object",
      properties: shortParserDefinition.properties.map(normalizeProperty)
    };
  } else if ("length" in shortParserDefinition) {
    if (shortParserDefinition.type !== "array") {
      return normalize({
        type: "array",
        length: shortParserDefinition.length,
        items: shortParserDefinition.items
          ? normalize(shortParserDefinition.items)
          : // TypeScript seems unable to select the subset ShortParserDefinition
            // that is correct here. It selects ShortArrayParserDefinition instead of
            // ShortNumberParserDefiniton | StringParserDefinition. Hence the cast.
            normalize({ type: shortParserDefinition.type } as
              | ShortNumberParserDefinition
              | StringParserDefinition)
      });
    } else {
      return {
        type: "array",
        length: shortParserDefinition.length,
        items: normalize(shortParserDefinition.items || {})
      };
    }
  } else if (!shortParserDefinition.type) {
    return { type: "number" };
  } else {
    return { type: shortParserDefinition.type };
  }
};

const normalizeProperty = (
  shortPropertyParserDefinition: ShortPropertyParserDefinition
): PropertyParserDefinition => {
  if (typeof shortPropertyParserDefinition === "string") {
    return { [shortPropertyParserDefinition]: normalize({}) };
  }
  const [[propertyName, parserDefinition]] = Object.entries(
    shortPropertyParserDefinition
  );
  return { [propertyName]: normalize(parserDefinition) };
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
  | string;

type ShortArrayParserDefinition = {
  length: ArrayParserDefinition["length"];
  type?: "number" | "string" | "array";
  items?: ShortParserDefinition;
};

type ShortNumberParserDefinition = Partial<NumberParserDefinition>;
