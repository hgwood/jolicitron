import {
  parseString,
  Parser,
  parseNumber,
  makeArrayParser,
  makeObjectParser
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
      return parseNumber;
    case "string":
      return parseString;
  }
};

const compileObject = ({
  properties
}: ObjectParserDefinition): Parser<{ [key: string]: unknown }> => {
  const parsers = properties.map(({ name, value }) => {
    return { name, value: compile(value) };
  });
  return makeObjectParser(parsers);
};

const compileArray = ({
  length,
  items
}: ArrayParserDefinition): Parser<unknown[]> => {
  return makeArrayParser(length, compile(items));
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

export type PropertyParserDefinition = {
  name: string;
  value: ParserDefinition;
};

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
