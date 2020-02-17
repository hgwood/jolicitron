import { times } from "./utils/times";

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
  const propertyParsers = properties.map(propertyParserDefinition => {
    const [[propertyName, parserDefinition]] = Object.entries(
      propertyParserDefinition
    );
    return [propertyName, compile(parserDefinition)] as const;
  })
  return (tokens, context = {}) => {
    return propertyParsers.reduce(
      (objectParserResult, [propertyName, propertyParser]) => {
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
  const itemParser = compile(items);
  return (tokens, context = {}) => {
    const lengthValue = Number(context?.[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context?.[length]}'`
      );
    }
    return times(lengthValue).reduce(
      arrayParserResult => {
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
