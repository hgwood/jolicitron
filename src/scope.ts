export type OwnScope = { [key: string]: unknown };
export type ParentScope = Readonly<OwnScope>;

export function createScope(parentScope?: ParentScope) {
  return Object.create(parentScope || null);
}
