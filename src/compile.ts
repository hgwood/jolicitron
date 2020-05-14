import {
  parseString,
  Parser,
  parseNumber,
  makeArrayParser,
  makeObjectParser,
} from "./parse";

export const compile = (schema: NormalSchema): Parser<unknown> => {
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
  properties,
}: NormalObjectSchema): Parser<{ [key: string]: unknown }> => {
  const parsers = properties.map(({ name, value }) => {
    return { name, value: compile(value) };
  });
  return makeObjectParser(parsers);
};

const compileArraySchema = ({
  length,
  items,
}: NormalArraySchema): Parser<unknown[]> => {
  return makeArrayParser(length, compile(items));
};

export type NormalSchema =
  | NormalObjectSchema
  | NormalArraySchema
  | NormalNumberSchema
  | NormalStringSchema;

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
