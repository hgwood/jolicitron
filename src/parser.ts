export const parseAsObject = (
  parsers: ReadonlyArray<PropertyParserOptions<any>>
): Parser<{ [key: string]: any }> => {
  return (input, context = {}) => {
    return parsers.reduce(
      (output, { name, parser, erase = false }) => {
        const property = parser(output.remaining, output.context);
        return {
          value: erase
            ? output.value
            : { ...output.value, [name]: property.value },
          remaining: property.remaining,
          context: { ...output.context, [name]: property.value }
        };
      },
      { value: {}, remaining: input, context }
    );
  };
};

export const parseAsArray = <T>({
  length,
  parser
}: ArrayParserOptions<T>): Parser<Array<T>> => {
  return (input, context = {}) => {
    if (!context || !context[length]) {
      throw new RangeError(`'${length}' not found in context`);
    }
    return Array.from({ length: context[length] as number } as ArrayLike<
      number
    >).reduce(
      output => {
        const item = parser(output.remaining, context);
        return {
          ...item,
          value: [...output.value, item.value]
        };
      },
      {
        value: [],
        remaining: input,
        context
      }
    );
  };
};

export const parseAsNumber: Parser<number> = (input, context) => {
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

type Context = { [key: string]: unknown };

type Parser<T> = (
  input: string,
  context?: Context
) => { value: T; remaining: string; context?: Context };

type PropertyParserOptions<T> = {
  name: string;
  parser: Parser<unknown>;
  erase?: boolean;
};

type ArrayParserOptions<T> = {
  length: string;
  parser: Parser<T>;
};
