// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import Generator from 'yeoman-generator';
import chalk from 'chalk';
import { textSync } from 'figlet';
import { join, sep } from 'path';
import { writeFile } from 'fs';
import { copy, readJson } from 'fs-extra';
import { promisify } from 'util';
const clear = require('clear');
const validate = require('validate-npm-package-name');

enum ProjectRepo {
  Example = 'make-it-happen-react',
  Seed = 'jsonforms-react-seed',
}

enum Project {
  Example = 'example',
  Seed = 'seed',
}

const writeFileWithPromise = promisify(writeFile);

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
    this.option('skipPrompting', { type: Boolean } );

    this.project = this.options.project;
    this.repo = '';
    this.path = this.options.path;
    this.name = this.options.name;
    this.skipPrompting = this.options.skipPrompting;

    switch (this.project) {
      case Project.Example:
        this.repo = ProjectRepo.Example;
        break;
      case Project.Seed:
        this.repo = ProjectRepo.Seed;
        break;
      default:
        break;
    }
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
            if (this.project !== Project.Example
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
    this.log('Writing files to disk');
    const source = join(__dirname, '../../node_modules/' + this.repo);
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

    if (this.project === Project.Seed && this.name != null) {
      const packagePath = this.path + sep + 'package.json';
      let packageJson = null;
      try {
        packageJson = await readJson(packagePath);
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

    process.chdir(this.path);
    this.installDependencies({
      bower: false,
      npm: true
    });
  }
}

export default JsonformsGenerator;
