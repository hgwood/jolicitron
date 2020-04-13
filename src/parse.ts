export function makeObjectParser(
  propertyParsers: {
    name: string;
    value: Parser<unknown>;
  }[]
): Parser<{ [key: string]: unknown }> {
  return function parseObject(tokens, parentContext) {
    const result: { [key: string]: unknown } = {};
    const context: OpenContext = {
      variables: Object.create(parentContext.variables)
    };
    for (const { name, value: parser } of propertyParsers) {
      const { value } = parser(tokens, context);
      result[name] = value;
      if (typeof value === "number") {
        // Looks like it could be a length for a future array, lets remember it
        if (context.variables.hasOwnProperty(name)) {
          // console.warn(`WARNING: overriding variable '${name}'`);
        } else if (parentContext.variables[name]) {
          // console.warn(`WARNING: shadowing variable '${name}'`);
        }
        context.variables[name] = value;
      }
    }
    return { value: result, context };
  };
}

export function makeArrayParser<T>(
  length: string,
  itemParser: Parser<T>
): Parser<T[]> {
  return function parseArray(tokens, context) {
    const lengthValue = Number(context.variables[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${context.variables[length]}' which evaluated to '${lengthValue}'`
      );
    }
    const result = [];
    for (let i = 0; i < lengthValue; i++) {
      const { value } = itemParser(tokens, context);
      result.push(value);
    }
    return { value: result, context };
  };
}

export const parseNumber: Parser<number> = (tokens, context) => {
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

export const parseString: Parser<string> = (tokens, context) => {
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
