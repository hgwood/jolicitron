import { compile } from "./compile";
import { ShortSchema, normalize } from "./normalize";
import { tokenize } from "./tokenize";

export default (schema: ShortSchema, input: string) => {
  const normalized = normalize(schema);
  const parser = compile(normalized);
  const tokens = tokenize(input);
  const result = parser(tokens, {});
  return result;
};
