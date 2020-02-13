import test from "tape";
import fs from "fs";
import path from "path";
import jolicitron from "../src";

const examplesDirectory = path.join(__dirname, "../examples");
const readJson = (fileName: string) => require(fileName);
const readText = (fileName: string) => fs.readFileSync(fileName).toString();

fs.readdirSync(examplesDirectory).forEach(exampleName => {
  const exampleDirectory = path.join(examplesDirectory, exampleName);
  const input = readText(
    path.join(exampleDirectory, `${exampleName}-input.txt`)
  );
  const expected = readJson(
    path.join(exampleDirectory, `${exampleName}-expected-output.json`)
  );
  [
    [
      "normalized",
      readJson(
        path.join(exampleDirectory, `${exampleName}-normalized-parser.json`)
      )
    ],
    [
      "shorthand",
      readJson(
        path.join(exampleDirectory, `${exampleName}-shorthand-parser.json`)
      )
    ]
  ].forEach(([parserName, parserDefinition]) => {
    test(`${exampleName} example, ${parserName} parser`, t => {
      const actual = jolicitron(parserDefinition, input);
      t.deepEqual(actual, expected);
      t.end();
    });
  });
});
