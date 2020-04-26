import { compile } from "./compile";
import { Schema, normalize } from "./normalize";
import { tokenize } from "./tokenize";
import { typecheckSchema } from "./typecheck";

export default (schema: unknown, input: string) => {
  const validSchema = typecheckSchema(schema);
  const normalSchema = normalize(validSchema);
  const parser = compile(normalSchema);
  const tokens = tokenize(input);
  const result = parser(tokens, {});
  return result;
};
