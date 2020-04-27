export type PathSegment = string | number;

export type Path = PathSegment[];

export function push(path: Path, pathSegment: PathSegment) {
  return [...path, pathSegment];
}

function getAtPath(root: any, path: Path) {
  return path.reduce((node, prop) => {
    return node[prop];
  }, root);
}

function pathToString(path: Path) {
  const stringSegments = path.map((segment) => {
    const asNumber = Number(segment);
    if (typeof segment === "number") {
      return `[${segment}]`;
    } else if (Number.isInteger(asNumber)) {
      return `[${segment}]`;
    } else if (segment.match(/^\w+$/)) {
      return `.${segment}`;
    } else {
      return `["${segment}"]`;
    }
  });
  return ["$", ...stringSegments].join("");
}

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

type Stack = {
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
