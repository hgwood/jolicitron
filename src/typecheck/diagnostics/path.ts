export type PathSegment = string | number;

export type Path = PathSegment[];

export function push(path: Path, pathSegment: PathSegment) {
  return [...path, pathSegment];
}

export function getAtPath(root: any, path: Path) {
  return path.reduce((node, prop) => {
    return node[prop];
  }, root);
}

export function pathToString(path: Path) {
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
