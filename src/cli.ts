import fs from "fs";
import yargs from "yargs";
import jolicitron from "./";

const args = yargs
  .scriptName("jolicitron")
  .option("input", {
    describe: "Path to the input file",
    type: "string"
  })
  .option("output", {
    describe: "Path to the output file",
    type: "string"
  })
  .option("schema", {
    describe: "Path to the schema file",
    type: "string"
  })
  .demandOption(["input", "output", "schema"])
  .help().argv;

const input = fs.readFileSync(args.input).toString();
const schema = JSON.parse(fs.readFileSync(args.schema).toString()) as unknown;
const output = jolicitron(
  schema,
  input
);
fs.writeFileSync(args.output, JSON.stringify(output, null, 2));
