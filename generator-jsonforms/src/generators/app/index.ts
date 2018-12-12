'use strict';

// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import * as Generator from 'yeoman-generator';
import chalk from 'chalk';
const clear = require('clear');
const figlet = require('figlet');
const validate = require('validate-npm-package-name');
import { join } from 'path';
import { readFile, writeFile } from 'fs';

const SEED = 'jsonforms-react-seed';
const EXAMPLE = 'make-it-happen-react'

class JsonformsGenerator extends Generator {

  project: string;
  path: string;
  name: string;
  answers: any;

  constructor(args: any, opts: any) {
    super(args, opts);

    this.option('project', { type: String } );
    this.option('path', { type: String } );
    this.option('name', { type: String } );

    this.project = this.options.project;
    this.path = this.options.path;
    this.name = this.options.name;

    if(this.project == 'example') {
      this.project = EXAMPLE;
    }
    if(this.project == 'seed') {
      this.project = SEED;
    }
  }

  async prompting() {
    clear();
    console.log(
      chalk.blue(
        figlet.textSync('JSONForms Tooling', { horizontalLayout: 'full' }),
      ),
    );
    this.answers = await this.prompt([
      {
        name: 'project',
        type: 'list',
        message: 'Select a project',
        choices: [
          {
            name: 'Example Project',
            value: EXAMPLE
          },
          {
            name: 'Seed Project',
            value: SEED
          }
        ],
        when: (this.project == null)
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
        validate: function(value) {
          var valid = validate(value);
          return valid.validForNewPackages || 'Sorry, name can only contain URL-friendly characters and name can no longer contain capital letters.';
        },
        when: (answers) => {
          if ((answers.project === SEED || this.project === SEED)
          && (this.name == null || !validate(this.name).validForNewPackages)) {
            return true;
          };
          return false;
        }
      }
    ]);

    if(this.project == null) {
      this.project = this.answers.project;
    }
    if(this.answers.path == 'current' || this.path == 'current') {
      this.path = process.cwd();
    }
    if(this.path == null) {
      this.path = this.answers.path;
    }
    if(this.name == null || !validate(this.name).validForNewPackages) {
      this.name = this.answers.name;
    }
  }

  write() {
    var source = join(__dirname, '../../node_modules/'+this.project)+'/**';
    this.fs.copy(source, this.path);
  }

  install() {
    if(this.project == SEED && this.name != null) {
      var packagePath = this.path + '/package.json';
      readFile(packagePath, 'utf8', (readError, data) => {

        if (readError) {
          this.log(chalk.red(readError.message));
          return;
        }
    
        let packageJson = JSON.parse(data);
        packageJson.name = this.name;

        writeFile(packagePath, JSON.stringify(packageJson, null, 2), writeError => {
          if (writeError) {
            this.log(chalk.red(writeError.message));
            return;
          }
        });
      });
    }

    process.chdir(this.path);
    this.npmInstall();
  }
};
  
export default JsonformsGenerator;
