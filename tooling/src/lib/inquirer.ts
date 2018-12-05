
import { prompt } from 'inquirer';

export const tool = () => {
  const questions = [
    {
      name: 'tool',
      type: 'list',
      message: 'What do you want to do?',
      choices: ['Create Seed Project', 'Create Example Project', 'Generate UI Schema'],
      default: 0,
    },
  ];
  return prompt(questions);
};

export const seedProjectParameters = () => {
  const questions = [
    {
      name: 'name',
      type: 'input',
      message: 'Enter the name of the seed project:',
      default: 'jsonforms-seed',
    },
    {
      name: 'path',
      type: 'input',
      message: 'Enter the path where the project will be installed:',
      default: 'current',
    },
  ];
  return prompt(questions);
};

export const exampleProjectParameters = () => {
  const questions = [
    {
      name: 'path',
      type: 'input',
      message: 'Enter the path where the project will be installed:',
      default: 'current',
    },
  ];
  return prompt(questions);
};

export const uiSchemaParameters = () => {
  const questions = [
    {
      name: 'schemapath',
      type: 'input',
      message: 'Enter the path to the schema file:',
      default: './schema.json',
    },
    {
      name: 'uiname',
      type: 'input',
      message: 'Enter the name of the ui schema file that will be generated:',
      default: 'ui-schema.json',
    },
  ];
  return prompt(questions);
};
