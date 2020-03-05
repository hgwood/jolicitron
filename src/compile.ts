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
  return (tokens, context) => {
    const result = { value: {}, context };
    for (const [propertyName, propertyParser] of propertyParsers) {
      const propertyParserResult = propertyParser(tokens, result.context);
      // @ts-ignore
      result.value[propertyName] = propertyParserResult.value;
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
  return (tokens, context) => {
    const lengthValue = Number(context[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context[length]}'`
      );
    }
    const result = {
      value: [],
      context
    } as ParserResult<unknown[]>;
    for (let i = 0; i < lengthValue; i++) {
      const itemParserResult = itemParser(tokens, context);
      result.context = itemParserResult.context;
      result.value.push(itemParserResult.value);
    }
    return result;
  };
};

export const compileNumber = (
  parserDefinition: NumberParserDefinition
): Parser<number> => {
  return (tokens, context) => {
    const next = tokens.next();
    if (next.done) {
      throw new RangeError(`expected number but found no more tokens`);
    }
    const value = Number(next.value);
    if (Number.isNaN(value)) {
      throw new RangeError(
        `expected number but found '${next.value}' which evaluated to '${value}'`
      );
    }
    return {
      value,
      context
    };
  };
};

export const compileString = (
  parserDefinition: StringParserDefinition
): Parser<string> => {
  return (tokens, context) => {
    const next = tokens.next();
    if (next.done) {
      throw new RangeError(`expected string but found no more tokens`);
    }
    return {
      value: next.value,
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
  tokens: Iterator<string>,
  context: Context
) => ParserResult<T>;

type Context = { [key: string]: unknown };

type ParserResult<T> = {
  value: T;
  context: Context;
};
