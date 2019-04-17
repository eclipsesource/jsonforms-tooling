// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import Generator from 'yeoman-generator';
import { generateDefaultUISchema } from '@jsonforms/core';
import chalk from 'chalk';
import { textSync } from 'figlet';
import { join } from 'path';
import { readFile, writeFile } from 'fs';
import { copy } from 'fs-extra';
import { promisify } from 'util';
const clear = require('clear');
const validate = require('validate-npm-package-name');

const writeFileWithPromise = promisify(writeFile);
const readFileWithPromise = promisify(readFile);

export class JsonformsGenerator extends Generator {

  path: string;
  schemaPath: string;
  name: string;
  skipPrompting = false;
  answers: any;

  constructor(args: any, opts: any) {
    super(args, opts);

    this.option('project', { type: String } );
    this.option('path', { type: String } );
    this.option('schemaPath', { type: String } );
    this.option('name', { type: String } );
    this.option('skipPrompting', { type: Boolean } );

    this.path = this.options.path;
    this.schemaPath = this.options.schemaPath;
    this.name = this.options.name;
    this.skipPrompting = this.options.skipPrompting;
  }

  async prompting() {
    if (!this.skipPrompting) {
      clear();
      this.log(
        chalk.blue(
          textSync('JSONForms Tooling', { horizontalLayout: 'full' }),
        ),
      );
      this.answers = await this.prompt([
        {
          name: 'path',
          type: 'input',
          message: 'Enter the path where the project will be installed:',
          default: 'current',
          when: (this.path == null)
        },
        {
          name: 'schemaPath',
          type: 'input',
          message: 'Enter the path of schema from which the ui schema will be generated:',
          default: 'required',
          when: (this.schemaPath == null)
        },
        {
          name: 'name',
          type: 'input',
          message: `Enter a name for your seed project:`,
          default: `jsonforms-react-seed`,
          validate: value => {
            const valid = validate(value);
            return valid.validForNewPackages || 'Sorry, name can only contain URL-friendly ' +
            'characters and name can no longer contain capital letters.';
          },
          when: () => {
            if (!validate(this.name).validForNewPackages) {
              this.log(chalk.red('Sorry, name can only contain URL-friendly ' +
              'characters and name can no longer contain capital letters.'));
              return true;
            }
            return false;
          }
        }
      ]);
      if (this.answers && this.answers.path === 'current' || this.path === 'current') {
        this.path = process.cwd();
      }
      if (this.path == null) {
        this.path = this.answers.path;
      }
      if (this.schemaPath == null) {
        this.schemaPath = this.answers.schemaPath;
      }
      if (this.name == null || !validate(this.name).validForNewPackages) {
        this.name = this.answers.name;
      }
    }
  }

  async write() {
    this.log('Writing files to disk');
    const source = join(__dirname, '../../node_modules', 'jsonforms-react-seed');
    try {
      await copy(source, this.path);
      this.log('Done writing files');
    } catch (err) {
      this.log(err);
      return;
    }
  }

  async install() {
    this.log('Installing dependencies. This can take a while.');

    if (this.name != null) {
      const packagePath = join(this.path, 'package.json');
      let packageJson = null;
      try {
        const content = await readFileWithPromise(packagePath, 'utf8');
        packageJson = JSON.parse(content);
      } catch (err) {
        this.log(chalk.red(err.message));
        return;
      }
      packageJson.name = this.name;

      try {
        await writeFileWithPromise(packagePath, JSON.stringify(packageJson, null, 2));
      } catch (err) {
        this.log(chalk.red(err.message));
        return;
      }
    }

    if (this.schemaPath !== '') {
      await this.getSchemaFromPath(this.schemaPath);
    }

    process.chdir(this.path);
    this.installDependencies({
      bower: false,
      npm: true
    });
  }

  /**
   * Function to retrieve OpenAPI definition from endpoint and get the JSON UI Schema
   * from it to save it in JSON format.
   * @param {string} schemaPath path to the schema file for generating the ui schema.
   */
  getSchemaFromPath = async (schemaPath: string) => {
    let jsonSchema = null;
    try {
      const content = await readFileWithPromise(schemaPath, 'utf8');
      jsonSchema = JSON.parse(content);
    } catch (err) {
      this.log(chalk.red(err.message));
      return;
    }
    this.log('Saving json schema file into project...');
    const srcPath = join(this.path, 'src');
    try {
      await writeFileWithPromise(join(srcPath, 'schema.json'), JSON.stringify(jsonSchema, null, 2));
    } catch (err) {
      this.log(chalk.red(err.message));
      return;
    }
    this.log('Successfully generated the schema file!');
    this.log('Generating the UI Schema file...');
    await this.generateUISchema(join(srcPath, 'uischema.json'), jsonSchema);
  };

  /**
   * Generate file containing JSON UI Schema.
   * @param path {string} : Path to which the file will be saved.
   * @param jsonSchema {any} : Valid JSON Schema to generate the UI Schema from.
   */
  generateUISchema = async (path: string, jsonSchema: any) => {
    // Generate UI Schema
    const jsonUISchema = await generateDefaultUISchema(jsonSchema);
    try {
      await writeFileWithPromise(path, JSON.stringify(jsonUISchema, null, 2));
    } catch (err) {
      this.log(chalk.red(err.message));
      return;
    }
    this.log('Successfully generated the UI Schema file!');
  };
}

export default JsonformsGenerator;
