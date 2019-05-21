// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import Generator from 'yeoman-generator';
import { generateDefaultUISchema } from '@jsonforms/core';
import chalk from 'chalk';
import { textSync } from 'figlet';
import { join } from 'path';
import { readFile, stat, writeFile } from 'fs';
import { copy } from 'fs-extra';
import { promisify } from 'util';
const clear = require('clear');
const validate = require('validate-npm-package-name');

const readFileWithPromise = promisify(readFile);
const statWithPromise = promisify(stat);
const writeFileWithPromise = promisify(writeFile);

export enum MessageType {
  Error = 'err',
  Warning = 'war',
  Information = 'info'
}

export class JsonformsGenerator extends Generator {

  path: string;
  schemaPath: string;
  name: string;
  skipPrompting = false;
  answers: any;

  constructor(args: any, opts: any) {
    super(args, opts);

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
          message: 'Enter the path where the project will be installed (default: current folder):',
          validate: async value => {
            if (value !== '') {
              try {
                await statWithPromise(value);
              } catch (err) {
                return 'Folder does not exists';
              }
            }
            return true;
          },
          when: (this.path == null)
        },
        {
          name: 'schemaPath',
          type: 'input',
          message: 'Enter the path of schema from which the ui schema will be generated (leave empty for default schema):',
          validate: async value => {
            if (value !== '') {
              try {
                await statWithPromise(value);
              } catch (err) {
                return 'Schema file does not exists';
              }
            }
            return true;
          },
          when: (this.schemaPath == null)
        },
        {
          name: 'name',
          type: 'input',
          message: `Enter a name for your seed project (default: jsonforms-react-seed):`,
          validate: value => {
            if (value !== '') {
              const valid = validate(value);
              return valid.validForNewPackages || 'Sorry, name can only contain URL-friendly ' +
              'characters and name can no longer contain capital letters.';
            }
            return true;
          },
          when: () => {
            if (this.name === undefined) {
              return true;
            }
            if (!validate(this.name).validForNewPackages) {
              this.log(chalk.red('Sorry, name can only contain URL-friendly ' +
              'characters and name can no longer contain capital letters.'));
              return true;
            }
            return false;
          }
        }
      ]);
      if (this.answers && this.answers.path === '' || this.path === '') {
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
      this.log(chalk.red(err.message), MessageType.Error);
      return;
    }
  }

  async install() {
    this.log('Installing dependencies. This can take a while.');

    if (this.name !== '') {
      const packagePath = join(this.path, 'package.json');
      let packageJson = null;
      try {
        const content = await readFileWithPromise(packagePath, 'utf8');
        packageJson = JSON.parse(content);
      } catch (err) {
        this.log(chalk.red(err.message), MessageType.Error);
        return;
      }
      packageJson.name = this.name;

      try {
        await writeFileWithPromise(packagePath, JSON.stringify(packageJson, null, 2));
      } catch (err) {
        this.log(chalk.red(err.message), MessageType.Error);
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
    const srcPath = join(this.path, 'src');
    let jsonSchema = null;
    try {
      const content = await readFileWithPromise(schemaPath, 'utf8');
      jsonSchema = JSON.parse(content);
    } catch (err) {
      this.log(chalk.red(err.message), MessageType.Error);
      return;
    }

    this.log('Generating the uischema file...');
    await this.generateUISchema(join(srcPath, 'uischema.json'), jsonSchema);

    this.log('Saving json schema file into project...');
    try {
      await writeFileWithPromise(join(srcPath, 'schema.json'), JSON.stringify(jsonSchema, null, 2));
    } catch (err) {
      this.log(chalk.red(err.message), MessageType.Error);
      return;
    }
    this.log('Successfully saved the schema file!');
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
      if (jsonUISchema === null) {
        this.log(chalk.red('Schema file was not valid. Default schema will be used.'), MessageType.Error);
        return;
      }
      await writeFileWithPromise(path, JSON.stringify(jsonUISchema, null, 2));
      this.log('Successfully generated the uischema file!');
    } catch (err) {
      this.log(chalk.red(err.message), MessageType.Error);
      return;
    }
  };
}

export default JsonformsGenerator;
