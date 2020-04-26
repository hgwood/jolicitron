import { Schema } from "../normalize";
import { typecheckSchemaAt } from "./typecheckAt";
import { buildErrorMessage } from "./error";

/**
 * Cannot use type guard because no type-checking inside
 * Cannot use type assert because no type-checking inside
 * => Must return value with more narrow type
 *
 * TypeScript 3.8 does not support narrowing an object (or array) type based
 * on guards on its properties (or elements).
 * => Must return copies or objects and arrays
 */

export function isSchema(schema: unknown): schema is Schema {
  try {
    typecheckSchema(schema);
    return true;
  } catch (err) {
    return false;
  }
}

export function typecheckSchema(schema: unknown): Schema {
  try {
    return typecheckSchemaAt(schema, []);
  } catch (err) {
    throw new TypeError(buildErrorMessage(err, schema));
  }
}
