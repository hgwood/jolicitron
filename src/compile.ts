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
  });
  return (tokens, currentTokenIndex = 0, context = {}) => {
    const result = { value: {}, currentTokenIndex, context };
    for (const [propertyName, propertyParser] of propertyParsers) {
      const propertyParserResult = propertyParser(
        tokens,
        result.currentTokenIndex,
        result.context
      );
      // @ts-ignore
      result.value[propertyName] = propertyParserResult.value;
      result.currentTokenIndex = propertyParserResult.currentTokenIndex;
      result.context[propertyName] = propertyParserResult.value;
    }
    return result;
  };
};

export const compileArray = ({
  length,
  items
}: ArrayParserDefinition): Parser<unknown[]> => {
  const itemParser = compile(items);
  return (tokens, currentTokenIndex = 0, context = {}) => {
    const lengthValue = Number(context?.[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context?.[length]}'`
      );
    }
    const result = {
      value: [],
      currentTokenIndex,
      context
    } as ParserResult<unknown[]>;
    for (let i = 0; i < lengthValue; i++) {
      const itemParserResult = itemParser(
        tokens,
        result.currentTokenIndex,
        context
      );
      result.currentTokenIndex = itemParserResult.currentTokenIndex;
      result.context = itemParserResult.context;
      result.value.push(itemParserResult.value);
    }
    return result;
  };
};

export const compileNumber = (
  parserDefinition: NumberParserDefinition
): Parser<number> => {
  return (tokens, currentTokenIndex = 0, context = {}) => {
    const nextToken = tokens[currentTokenIndex];
    const value = Number(nextToken);
    if (Number.isNaN(value)) {
      throw new RangeError(`expected number but found '${value}'`);
    }
    return {
      value,
      currentTokenIndex: currentTokenIndex + 1,
      context
    };
  };
};

export const compileString = (
  parserDefinition: StringParserDefinition
): Parser<string> => {
  return (tokens, currentTokenIndex = 0, context = {}) => {
    return {
      value: tokens[currentTokenIndex],
      currentTokenIndex: currentTokenIndex + 1,
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

type Parser<T> = (
  tokens: string[],
  currentTokenIndex?: number,
  context?: Context
) => ParserResult<T>;

type Context = { [key: string]: unknown };

type ParserResult<T> = {
  value: T;
  currentTokenIndex: number;
  context?: Context;
};
