'use strict';

import * as Generator from 'yeoman-generator';
import { join } from 'path';

class JsonformsGenerator extends Generator {

  answers: any;

  async prompting() {
    this.answers = await this.prompt([
      {
        name: 'project',
        type: 'list',
        message: 'Select a project',
        choices: [{
          name: 'Example Project',
          value: 'make-it-happen-react'
        }, {
          name: 'Seed Project',
          value: 'jsonforms-react-seed'
        }]
      },
      {
        name: 'path',
        type: 'input',
        message: 'Enter the path where the project will be installed:',
        default: 'current',
      },
      {
        name: 'name',
        type: 'input',
        message: 'Enter the name of the seed project:',
        default: 'jsonforms-seed',
        when: function(answers) {
          return answers.project === 'jsonforms-react-seed';
        }
      }
    ]);
  }

  write() {
    this.fs.copy(
      join(__dirname, '../../node_modules/'+this.answers.project+'/**'),
      join(__dirname, '../../dist/')
    );
  }

  install() {
    process.chdir(join(__dirname, '../../dist/'));
    this.npmInstall();
  }
};
  
export default JsonformsGenerator;
