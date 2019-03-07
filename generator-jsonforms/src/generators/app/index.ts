// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
'use strict';

import Generator from 'yeoman-generator';
import { generateDefaultUISchema } from '@jsonforms/core';
import chalk from 'chalk';
const clear = require('clear');
const figlet = require('figlet');
const validate = require('validate-npm-package-name');
import { join, sep } from 'path';
import { readFile, writeFile } from 'fs';

enum ProjectRepo {
  Scaffolding = 'jsonforms-scaffolding-project',
  Example = 'make-it-happen-react',
  Seed = 'jsonforms-react-seed',
}

enum Project {
  Scaffolding = 'scaffolding',
  Example = 'example',
  Seed = 'seed',
}

export class JsonformsGenerator extends Generator {

  project: string;
  repo: string;
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

    this.project = this.options.project;
    this.repo = '';
    this.path = this.options.path;
    this.schemaPath = this.options.schemaPath;
    this.name = this.options.name;
    this.skipPrompting = this.options.skipPromting;

    if (this.project === Project.Scaffolding) {
      this.repo = ProjectRepo.Scaffolding;
    }
    if (this.project === Project.Example) {
      this.repo = ProjectRepo.Example;
    }
    if (this.project === Project.Seed) {
      this.repo = ProjectRepo.Seed;
    }
  }

  async prompting() {
    clear();
    this.log(
      chalk.blue(
        figlet.textSync('JSONForms Tooling', { horizontalLayout: 'full' }),
      ),
    );
    if (!this.skipPrompting) {
      this.answers = await this.prompt([
        {
          name: 'project',
          type: 'list',
          message: 'Select a project',
          choices: [
            {
              name: 'Scaffolding Project',
              value: ProjectRepo.Scaffolding
            },
            {
              name: 'Example Project',
              value: ProjectRepo.Example
            },
            {
              name: 'Seed Project',
              value: ProjectRepo.Seed
            }
          ],
          when: () => {
            if (this.project == null) {
              return true;
            }
            if (this.project !== Project.Scaffolding
              && this.project !== Project.Example
              && this.project !== Project.Seed) {
              return true;
            }
            return false;
          }
        },
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
          when: answers => (
            answers.project === ProjectRepo.Scaffolding ||
            this.project === ProjectRepo.Scaffolding
          )
        },
        {
          name: 'name',
          type: 'input',
          message: `Enter the name of the ${this.project} project:`,
          default: `jsonforms-${this.project}`,
          validate: value => {
            const valid = validate(value);
            return valid.validForNewPackages || 'Sorry, name can only contain URL-friendly ' +
            'characters and name can no longer contain capital letters.';
          },
          when: answers => {
            if (
              answers.project === Project.Seed ||
              this.project === Project.Seed ||
              answers.project === Project.Scaffolding ||
              this.project === Project.Scaffolding
            ) {
              if (this.name == null) {
                return true;
              }
              if (!validate(this.name).validForNewPackages) {
                this.log(chalk.red('Sorry, name can only contain URL-friendly ' +
                'characters and name can no longer contain capital letters.'));
                return true;
              }
            }
            return false;
          }
        }
      ]);
      if (this.project == null) {
        this.repo = this.answers.project;
      }
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
    this.log('writing');
    const source = join(__dirname, '../../node_modules/' + this.repo) + '/**';
    this.fs.copy(source, this.path);
  }

  async install() {
    this.log('installing');
    if ((this.project === Project.Seed || this.project === Project.Scaffolding) && this.name != null) {
      const packagePath = this.path + sep + 'package.json';
      readFile(packagePath, 'utf8', (readError, data) => {

        if ((readError != null) && readError.message) {
          this.log(chalk.red(readError.message));
          return;
        }

        const packageJson = JSON.parse(data);
        packageJson.name = this.name;

        writeFile(packagePath, JSON.stringify(packageJson, null, 2), writeError => {
          if (writeError.message) {
            this.log(chalk.red(writeError.message));
            return;
          }
        });
      });
    }

    if (this.project === Project.Scaffolding) {
      this.retrieveAndSaveJSONUISchemaFromAPI(this.repo, this.schemaPath);
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
   * @param {string} repo the name of the repo that should be cloned.
   * @param {string} schemaPath path to the schema file for generating the ui schema.
   */
  retrieveAndSaveJSONUISchemaFromAPI = (repo: string, schemaPath: string) => {
    readFile(schemaPath, 'utf8', (readError, data) => {
      if (readError.message) {
        this.log(chalk.red(readError.message));
        return;
      }
      const jsonSchema = JSON.parse(data);
      this.log('Saving json schema file into project...');
      const srcPath = this.path + sep +  'src';
      writeFile(
        srcPath + sep + 'schema.json',
        JSON.stringify(jsonSchema, null, 2),
        writeError => {
          if (writeError.message) {
            this.log(chalk.red(writeError.message));
            return;
          }
          this.log('Successfully generated the schema file!');
        }
      );
      this.log('Generating the UI Schema file...');
      this.generateJSONUISchemaFile(srcPath + sep + 'uischema.json', jsonSchema);
    });
  };

  /**
   * Generate file containing JSON UI Schema.
   * @param path {string} : Path to which the file will be saved.
   * @param jsonSchema {any} : Valid JSON Schema to generate the UI Schema from.
   */
  generateJSONUISchemaFile = (path: string, jsonSchema: any) => {
    // Generate UI Schema
    const jsonUISchema = generateDefaultUISchema(jsonSchema);
    writeFile(path, JSON.stringify(jsonUISchema, null, 2), writeError => {
      if (writeError.message) {
        this.log(chalk.red(writeError.message));
        return;
      }
      this.log('Successfully generated the UI Schema file!');
    });
  };
}

export default JsonformsGenerator;
