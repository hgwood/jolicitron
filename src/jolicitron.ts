import { compile } from "./compile";
import { Schema, normalize } from "./normalize";
import { tokenize } from "./tokenize";
import { parseSchema } from "./validate";

export default (schema: unknown, input: string) => {
  const validSchema = parseSchema(schema);
  const normalSchema = normalize(validSchema);
  const parser = compile(normalSchema);
  const tokens = tokenize(input);
  const result = parser(tokens, {});
  return result;
};
