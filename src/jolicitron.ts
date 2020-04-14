import { compile } from "./compile";
import { ShortParserDefinition, normalize } from "./normalize";
import { tokenize } from "./tokenize";

export default (parserDefinition: ShortParserDefinition, input: string) => {
  const normalized = normalize(parserDefinition);
  const parser = compile(normalized);
  const tokens = tokenize(input);
  const result = parser(tokens, {});
  return result;
};
