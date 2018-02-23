"use strict";

const test = require("tape");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const examplesDirectory = _.partial(path.join, __dirname, "../examples");

fs.readdirSync(examplesDirectory()).forEach(exampleName =>
  test(`${exampleName} example`, t => {
    const exampleDirectory = _.partial(examplesDirectory, exampleName);
    const input = fs.readFileSync(
      exampleDirectory(`${exampleName}.in.txt`),
      "utf8"
    );
    const output = require(exampleDirectory(`${exampleName}.out`));
    const parser = require(exampleDirectory(`${exampleName}`));
    const { parsedValue, remaining } = parser(input);
    t.ok(_.isEmpty(remaining));
    t.deepEqual(parsedValue, output);
    t.end();
  })
);
