import { Path, getAtPath, pathToString } from "./path";

export type Stack = {
  path: Path;
  value: unknown;
}[];

export function buildStack(schema: any, path: Path) {
  const stack = [];
  const stackPath: Path = [];
  while (path.length > 0) {
    stackPath.unshift(path.pop()!);
    stack.push({ path: [...stackPath], value: getAtPath(schema, [...path]) });
  }
  return stack;
}

export function stackToLines(stack: Stack) {
  return stack.map(
    ({ path, value }) =>
      `at ${pathToString(path)} in '${JSON.stringify(value, null, 2)}'`
  );
}
