export const parseObject = (
  propertyParsers: {
    [key: string]: Parser<unknown>;
  }[]
): Parser<{ [key: string]: unknown }> => (tokens, parentContext) => {
  const value: { [key: string]: unknown } = {};
  const context: OpenContext = {
    variables: Object.create(parentContext.variables)
  };
  for (const property of propertyParsers) {
    const [[propertyName, propertyParser]] = Object.entries(property);
    const propertyParserResult = propertyParser(tokens, context);
    value[propertyName] = propertyParserResult.value;
    if (typeof propertyParserResult.value === "number") {
      // Looks like it could be a length for a future array, lets remember it
      if (context.variables.hasOwnProperty(propertyName)) {
        console.warn(`WARNING: overriding variable '${propertyName}'`);
      } else if (parentContext.variables[propertyName]) {
        console.warn(`WARNING: shadowing variable '${propertyName}'`);
      }
      context.variables[propertyName] = propertyParserResult.value;
    }
  }
  return { value, context };
};

export const parseArray = <T>(
  length: string,
  itemParser: Parser<T>
): Parser<T[]> => (tokens, context) => {
  const lengthValue = Number(context.variables[length]);
  if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
    throw new RangeError(
      `expected '${length}' to be a safe positive integer but found '${context.variables[length]}' which evaluated to '${lengthValue}'`
    );
  }
  const value = [];
  for (let i = 0; i < lengthValue; i++) {
    const itemParserResult = itemParser(tokens, context);
    value.push(itemParserResult.value);
  }
  return { value, context };
};

export const parseNumber = (): Parser<number> => (tokens, context) => {
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

export const parseString = (): Parser<string> => (tokens, context) => {
  const next = tokens.next();
  if (next.done) {
    throw new RangeError(`expected string but found no more tokens`);
  }
  return {
    value: next.value,
    context
  };
};

export type Parser<T> = (
  tokens: Iterator<string>,
  context: ClosedContext
) => ParserResult<T>;

export type OpenContext = { readonly variables: { [key: string]: unknown } };

export type ClosedContext = OpenContext & {
  variables: Readonly<OpenContext["variables"]>;
};

export type ParserResult<T> = {
  value: T;
  context: ClosedContext;
};
