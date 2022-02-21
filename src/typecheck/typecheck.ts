import { Schema } from "../normalize";
import { typecheckSchemaAt } from "./typecheckAt";
import { buildErrorMessage } from "./diagnostics";

export function typecheckSchema(schema: unknown): Schema {
  try {
    return typecheckSchemaAt(schema, []);
  } catch (err: any) {
    throw new TypeError(buildErrorMessage(err, schema));
  }
}
