import { Path } from "./path";
import { buildStack, stackToLines } from "./stack";

export type TypeCheckingError = {
  expected: unknown[];
  actual: unknown;
  path: Path;
};

/**
 * This only exists so that `throw error(...)` is type-checked.
 */
export function error(error: TypeCheckingError): TypeCheckingError {
  return error;
}

export function buildErrorMessage(
  { expected, actual, path }: TypeCheckingError,
  schema: unknown
) {
  const stringifiedStack = stackToLines(buildStack(schema, path));
  const stringifiedExpected = expected.join(" or ");
  const stringifiedActual = JSON.stringify(actual, null, 2);
  return [
    `expected ${stringifiedExpected} but found '${stringifiedActual}'`,
    ...stringifiedStack,
  ].join("\n");
}
