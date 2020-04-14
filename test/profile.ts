import fs from "fs";
import { compile } from "../src/compile";
import { normalize } from "../src/normalize";
import { tokenize } from "../src/tokenize";

const [, , schemaFile, inputFile] = process.argv;

const schema = JSON.parse(fs.readFileSync(schemaFile).toString());
const input = fs.readFileSync(inputFile).toString();

console.profile("full");
console.profile("normalize");
const normalized = normalize(schema);
console.profileEnd("normalize");
console.profile("compile");
const parser = compile(normalized);
console.profileEnd("compile");
console.profile("tokenize");
const tokens = tokenize(input);
console.profileEnd("tokenize");
console.profile("parse");
const result = parser(tokens, {});
console.profileEnd("parse");
console.profileEnd("full");
// only to make sure there is no kind of 'unused code' elimination due to 'result' being unused
console.log(typeof result);
