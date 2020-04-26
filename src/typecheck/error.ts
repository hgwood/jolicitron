export type PathSegment = string | number;

export type Path = PathSegment[];

export function push(path: Path, pathSegment: PathSegment) {
  return [...path, pathSegment];
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
  const stack = buildStack(schema, path);
  const stringifiedExpected = expected.join(" or ");
  const stringifiedActual = JSON.stringify(actual, null, 2);
  return [
    `expected ${stringifiedExpected} but found '${stringifiedActual}'`,
    ...stack
  ].join("\n");
}

function buildStack(schema: any, path: Path) {
  const stack = [];
  const stackPath: Path = [];
  while (path.length > 0) {
    stackPath.unshift(path.pop()!);
    const stringifiedPath = pathToString([...stackPath]);
    const stringifiedValue = JSON.stringify(
      getAtPath(schema, [...path]),
      null,
      2
    );
    stack.push(`at ${stringifiedPath} in '${stringifiedValue}'`);
  }
  return stack;
}

function getAtPath(schema: any, path: Path) {
  return path.reduce((acc, e) => {
    return acc[e];
  }, schema);
}

function pathToString(path: Path) {
  const stringSegments = path.map(segment =>
    typeof segment === "number" ? `[${segment}]` : `.${segment}`
  );
  return ["$", ...stringSegments].join("");
}
