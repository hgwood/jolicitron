import { NormalSchema } from "../compile";

/**
 * NOTE: might seem redundant but actually useful because
 * Array.isArray casts to any[] while this casts to unknown[]
 * which is safer.
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isRecord(value: unknown): value is object {
  return typeof value === "object" && value !== null && !isArray(value);
}

export function hasProperty<Key extends string>(
  value: object,
  key: Key
): value is { [K in Key]: unknown } {
  return key in value;
}

export function hasTypeProperty<TypeValue extends NormalSchema["type"]>(
  value: object,
  type: TypeValue
): value is { type: TypeValue } {
  return hasProperty(value, "type") && value.type === type;
}
