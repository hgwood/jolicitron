import {
  parseString,
  Parser,
  parseNumber,
  makeArrayParser,
  makeObjectParser,
  makeLengthParser,
} from "./parse";

let xy = 0;

export const compile = (
  schema: NormalSchema,
  symbols: Map<string, number>
): Parser<unknown> => {
  switch (schema.type) {
    case "object":
      return compileObjectSchema(schema, symbols);
    case "array":
      return compileArraySchema(schema, symbols);
    case "number":
      return parseNumber;
    case "string":
      return parseString;
    case "length":
      return compileLengthParser(schema, symbols);
  }
};

const compileObjectSchema = (
  { properties }: NormalObjectSchema,
  symbols: Map<string, number>
): Parser<{ [key: string]: unknown }> => {
  const mySymbols = new Map(symbols);
  const parsers = properties.map(({ name, value }) => {
    mySymbols.set(name, ++xy);
    return { name, value: compile(value, mySymbols) };
  });
  return makeObjectParser(parsers);
};

const compileArraySchema = (
  { length, items }: NormalArraySchema,
  symbols: Map<string, number>
): Parser<unknown[]> => {
  return makeArrayParser(length, compile(items, symbols));
};

const compileLengthParser = (
  { name }: NormalLengthSchema,
  symbols: Map<string, number>
): Parser<number> => {
  return makeLengthParser(symbols.get(name));
};

export type NormalSchema =
  | NormalObjectSchema
  | NormalArraySchema
  | NormalNumberSchema
  | NormalStringSchema
  | NormalLengthSchema;

export type NormalObjectSchema = {
  type: "object";
  properties: NormalPropertySchema[];
};

export type NormalPropertySchema = {
  name: string;
  value: NormalSchema;
};

export type NormalArraySchema = {
  type: "array";
  length: string;
  items: NormalSchema;
};

export type NormalNumberSchema = {
  type: "number";
};

export type NormalStringSchema = {
  type: "string";
};

export type NormalLengthSchema = {
  type: "length";
  name: string;
};
