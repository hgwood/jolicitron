import {
  parseString,
  Parser,
  parseNumber,
  parseArray,
  parseObject
} from "./parse";

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
}: ObjectParserDefinition): Parser<{ [key: string]: unknown }> => {
  const parsers: {
    [key: string]: Parser<unknown>;
  }[] = properties.map(property => {
    const [[name, parserDefinition]] = Object.entries(property);
    return { [name]: compile(parserDefinition) };
  });
  return parseObject(parsers);
};

export const compileArray = ({
  length,
  items
}: ArrayParserDefinition): Parser<unknown[]> => {
  return parseArray(length, compile(items));
};

export const compileNumber = (
  parserDefinition: NumberParserDefinition
): Parser<number> => {
  return parseNumber();
};

export const compileString = (
  parserDefinition: StringParserDefinition
): Parser<string> => {
  return parseString();
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
