#!/usr/bin/env node

// tslint:disable:align
// tslint:disable:max-line-length
// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import chalk from 'chalk';
const figlet = require('figlet');
const clui = require('clui');
const Spinner = clui.Spinner;
const clear = require('clear');
import * as inquirerLib from './lib/inquirer';
import * as filesLib from './lib/files';
import * as tooling from './index';

const run = async () => {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('JSONForms Tooling', { horizontalLayout: 'full' }),
    ),
  );

  const tool: any = await inquirerLib.tool();
  let parameter: any;
  let status: any;

  const toolElem = 'tool';
  switch (tool[toolElem]) {
    case 'Create Seed Project':
      parameter = await inquirerLib.seedProjectParameters();
      if (!parameter.path) { parameter.path = filesLib.getCurrentPath(); }
      status = new Spinner('Cloning seed project...');
      status.start();
      tooling.cloneAndInstall('seed', parameter.path, (id: string, result: string) => {
        if (id === 'error') {
          console.error(result);
          status.stop();
          return;
        } else if (id === 'success') {
          console.log(result);
          status.stop();
          return;
        }
        status.message(result);
      }, parameter.name);
      break;

    case 'Create Example Project':
      parameter = await inquirerLib.exampleProjectParameters();
      if (!parameter.path) { parameter.path = filesLib.getCurrentPath(); }
      status = new Spinner('Cloning example project...');
      status.start();
      tooling.cloneAndInstall('example', parameter.path, (id: string, result: string) => {
        status.message(result);
        if (id === 'error') {
          console.error(result);
          status.stop();
          return;
        } else if (id === 'success') {
          console.log(result);
          status.stop();
          return;
        }
        status.message(result);
      });
      break;

    case 'Generate UI Schema':
      parameter = await inquirerLib.uiSchemaParameters();
      if (parameter.schemapath === './schema.json') {
        parameter.schemapath = filesLib.getCurrentPath() + filesLib.getSep() + 'schema.json' ;
      }
      status = new Spinner('Generating UI Schema...');
      status.start();
      tooling.generateUISchema(parameter.schemapath, parameter.uiname, (id: string, result: string) => {
        if (id === 'error') {
          console.error(chalk.red(result));
          status.stop();
          return;
        } else if (id === 'success') {
          console.log(chalk.green(result));
          status.stop();
          return;
        }
        status.message(result);
      });
      break;
    default:
      break;
  }
};

run();
