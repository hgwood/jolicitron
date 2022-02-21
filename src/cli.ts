#!/usr/bin/env node

import fs from "fs/promises";
import yargs from "yargs";
import jolicitron from "./";

async function main() {
  const args = await yargs
    .scriptName("jolicitron")
    .option("input", {
      describe: "Path to the input file",
      type: "string",
    })
    .option("output", {
      describe: "Path to the output file",
      type: "string",
    })
    .option("schema", {
      describe: "Path to the schema file",
      type: "string",
    })
    .demandOption(["input", "output", "schema"])
    .help().argv;

  const input = (await fs.readFile(args.input)).toString();
  const schema = JSON.parse(
    (await fs.readFile(args.schema)).toString()
  ) as unknown;
  const output = jolicitron(schema, input);
  await fs.writeFile(args.output, JSON.stringify(output, null, 2));
}

main();
