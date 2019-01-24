// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
'use strict';

import * as Generator from 'yeoman-generator';
import chalk from 'chalk';
const clear = require('clear');
const figlet = require('figlet');
const validate = require('validate-npm-package-name');
import { join, sep } from 'path';
import { readFile, writeFile } from 'fs';

enum ProjectRepo {
  Example = 'make-it-happen-react',
  Seed = 'jsonforms-react-seed',
}

enum Project {
  Example = 'example',
  Seed = 'seed',
}

export class JsonformsGenerator extends Generator {

  project: string;
  repo: string;
  path: string;
  name: string;
  skipPrompting = false;
  answers: any;

  constructor(args: any, opts: any) {
    super(args, opts);

    this.option('project', { type: String } );
    this.option('path', { type: String } );
    this.option('name', { type: String } );
    this.option('skipPrompting', { type: Boolean} );

    this.project = this.options.project;
    this.repo = '';
    this.path = this.options.path;
    this.name = this.options.name;
    this.skipPrompting = this.options.skipPromting;

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
            if (this.project !== 'example' && this.project !== 'seed') {
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
          name: 'name',
          type: 'input',
          message: 'Enter the name of the seed project:',
          default: 'jsonforms-seed',
          validate: value => {
            const valid = validate(value);
            return valid.validForNewPackages || 'Sorry, name can only contain URL-friendly ' +
            'characters and name can no longer contain capital letters.';
          },
          when: answers => {
            if (answers.project === Project.Seed || this.project === Project.Seed) {
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
    if (this.project === Project.Seed && this.name != null) {
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

    process.chdir(this.path);
    this.installDependencies({
      bower: false,
      npm: true
    });
  }
}

export default JsonformsGenerator;
