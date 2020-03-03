import fs from "fs";
import path from "path";

export const readTestData = async (
  directory: string,
  [input, parser, expected]: string[]
) => {
  return [
    await readText(directory, input),
    await readJson(directory, parser),
    await readJson(directory, expected)
  ];
};

export const readText = async (directory: string, file: string) => {
  return (await fs.promises.readFile(path.join(directory, file))).toString();
};

export const readJson = async (directory: string, file: string) => {
  return JSON.parse(
    (await fs.promises.readFile(path.join(directory, file))).toString()
  );
};
