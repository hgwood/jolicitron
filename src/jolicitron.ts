import { compile } from "./compile";
import { Schema, normalize } from "./normalize";
import { tokenize } from "./tokenize";

export default (schema: Schema, input: string) => {
  const normalSchema = normalize(schema);
  const parser = compile(normalSchema);
  const tokens = tokenize(input);
  const result = parser(tokens, {});
  return result;
};
