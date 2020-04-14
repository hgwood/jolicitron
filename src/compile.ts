import {
  parseString,
  Parser,
  parseNumber,
  makeArrayParser,
  makeObjectParser
} from "./parse";

export const compile = (schema: Schema): Parser<unknown> => {
  switch (schema.type) {
    case "object":
      return compileObjectSchema(schema);
    case "array":
      return compileArraySchema(schema);
    case "number":
      return parseNumber;
    case "string":
      return parseString;
  }
};

const compileObjectSchema = ({
  properties
}: ObjectSchema): Parser<{ [key: string]: unknown }> => {
  const parsers = properties.map(({ name, value }) => {
    return { name, value: compile(value) };
  });
  return makeObjectParser(parsers);
};

const compileArraySchema = ({
  length,
  items
}: ArraySchema): Parser<unknown[]> => {
  return makeArrayParser(length, compile(items));
};

export type Schema = ObjectSchema | ArraySchema | NumberSchema | StringSchema;

export type ObjectSchema = {
  type: "object";
  properties: PropertySchema[];
};

export type PropertySchema = {
  name: string;
  value: Schema;
};

export type ArraySchema = {
  type: "array";
  length: string;
  items: Schema;
};

export type NumberSchema = {
  type: "number";
};

export type StringSchema = {
  type: "string";
};
