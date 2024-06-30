import type { Program } from "../language/generated/ast.js";
import chalk from "chalk";
import { Command } from "commander";
import { JackLanguageMetaData } from "../language/generated/module.js";
import { createJackServices } from "../language/jack-module.js";
import { extractAstNode, extractDocument } from "./cli-util.js";
import { NodeFileSystem } from "langium/node";
import * as url from "node:url";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { generateHackVM } from "./compiler/generator.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const packagePath = path.resolve(__dirname, "..", "..", "package.json");
const packageContent = await fs.readFile(packagePath, "utf-8");

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
  const services = createJackServices(NodeFileSystem).Jack;
  const model = await extractAstNode<Program>(fileName, services);
  const generatedFilePath = generateHackVM(model, fileName, opts.destination);
  console.log(chalk.green(`HackVM code generated successfully: ${generatedFilePath}`));
};

export const validateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
  const services = createJackServices(NodeFileSystem).Jack;
  const document = await extractDocument(fileName, services);
  const parseResult = document.parseResult;
  if (parseResult.lexerErrors.length === 0 && parseResult.parserErrors.length === 0) {
    console.log(chalk.green(`Parsed and validated ${fileName} successfully!`));
  } else {
    console.log(chalk.red(`Failed to parse ${fileName}!`));
    parseResult.lexerErrors.forEach((le) => console.log(le.message));
    parseResult.parserErrors.forEach((pe) => console.log(pe.message));
  }
  // const validationErrors = await services.validation.DocumentValidator.validateDocument(document);
  // if (validationErrors.length) {
  //   console.log(chalk.red("Validations errors"));
  //   validationErrors.forEach((ve) => console.log(ve.message));
  // }
};

export type GenerateOptions = {
  destination?: string;
};

export default function (): void {
  const program = new Command();

  program.version(JSON.parse(packageContent).version);

  const fileExtensions = JackLanguageMetaData.fileExtensions.join(", ");
  program
    .command("generate")
    .argument("<file>", `source file (possible file extensions: ${fileExtensions})`)
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates HackVM code")
    .action(generateAction);

  program
    .command("validate")
    .argument("<file>", `source file (possible file extensions: ${fileExtensions})`)
    .description("Parse jack source code and validate for lexer or parser errors")
    .action(validateAction);

  program.parse(process.argv);
}
