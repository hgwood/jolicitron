import { Path, getWithin, pathToString } from "./path";

export type Stack = {
  path: Path;
  value: unknown;
}[];

export function buildStack(schema: any, path: Path) {
  return Array.from({ length: path.length }, (_, index) => {
    const pathWithinValue = path.slice(-index - 1);
    const pathToValue = path.slice(0, -index - 1);
    return { path: pathWithinValue, value: getWithin(pathToValue, schema) };
  });
}

export function stackToLines(stack: Stack) {
  return stack.map(
    ({ path, value }) =>
      `at ${pathToString(path)} in '${JSON.stringify(value, null, 2)}'`
  );
}
