import { ParentScope, createScope } from "./scope";

export function makeObjectParser(
  propertyParsers: {
    name: string;
    value: Parser<unknown>;
  }[]
): Parser<{ [key: string]: unknown }> {
  return function parseObject(tokens, variables) {
    const result: { [key: string]: unknown } = {};
    const ownVariables = createScope(variables);
    for (const { name, value: parser } of propertyParsers) {
      const value = parser(tokens, ownVariables);
      result[name] = value;
      if (typeof value === "number") {
        // Looks like it could be a length for a future array, lets remember it
        if (ownVariables.hasOwnProperty(name)) {
          console.warn(`WARNING: overriding variable '${name}'`);
        } else if (variables[name]) {
          console.warn(`WARNING: shadowing variable '${name}'`);
        }
        ownVariables[name] = value;
      }
    }
    return result;
  };
}

export function makeArrayParser<T>(
  length: string,
  itemParser: Parser<T>
): Parser<T[]> {
  return function parseArray(tokens, variables) {
    const lengthValue = Number(variables[length]);
    if (!Number.isSafeInteger(lengthValue) || lengthValue < 0) {
      throw new RangeError(
        `expected '${length}' to be a safe positive integer but found '${variables[length]}' which evaluated to '${lengthValue}'`
      );
    }
    const result = [];
    for (let i = 0; i < lengthValue; i++) {
      const value = itemParser(tokens, variables);
      result.push(value);
    }
    return result;
  };
}

export const parseNumber: Parser<number> = (tokens, context) => {
  const next = tokens.next();
  if (next.done) {
    throw new RangeError(`expected number but found no more tokens`);
  }
  const result = Number(next.value);
  if (Number.isNaN(result)) {
    throw new RangeError(
      `expected number but found '${next.value}' which evaluated to '${result}'`
    );
  }
  return result;
};

export const parseString: Parser<string> = (tokens, context) => {
  const next = tokens.next();
  if (next.done) {
    throw new RangeError(`expected string but found no more tokens`);
  }
  return next.value;
};

export type Parser<T> = (
  tokens: Iterator<string>,
  variables: ParentScope
) => ParserResult<T>;

export type ParserResult<T> = T;
