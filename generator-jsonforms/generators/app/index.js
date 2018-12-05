'use strict';

var Generator = require('yeoman-generator');
var path = require('path');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user

    const prompts = [
      {
        type: 'list',
        name: 'project',
        message: 'Select a project',
        choices: [{
          name: 'Example Project',
          value: 'example-project'
        }, {
          name: 'Seed Project',
          value: 'seed-project'
        }]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  write() {
    this.fs.copy(
      path.join(__dirname, '../../node_modules/'+this.props.project+'/**'),
      path.join(__dirname, '../../dist/')
    );
  }

  install() {
    this.installDependencies();
  }
};
  
