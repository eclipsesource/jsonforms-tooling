/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
import { createProject, generateUISchema } from 'jsonforms-tooling-common';

export const start = (context: theia.PluginContext) => {
  const createExampleProjectCommandOptions = {
    id: 'create-example-project',
    label: 'JSONForms: Create Example Project',
  };
  const createExampleProjectCommand = theia.commands.registerCommand(
    createExampleProjectCommandOptions,
    (args: any) => {
      if (!args) {
        createProject(theia, args, 'example');
      }
    }
  );

  const createSeedProjectCommandOptions = {
    id: 'create-seed-project',
    label: 'JSONForms: Create Seed Project',
  };
  const createSeedProjectCommand = theia.commands.registerCommand(
    createSeedProjectCommandOptions,
    (args: any) => {
      createProject(theia, args, 'seed');
    }
  );

  const generateUISchemaCommandOptions = {
    id: 'generate-ui-schema',
    label: 'JSONForms: Generate UI Schema',
  };
  const generateUISchemaCommand = theia.commands.registerCommand(
    generateUISchemaCommandOptions,
    (args: any) => {
      generateUISchema(theia, args);
    }
  );

  context.subscriptions.push(createExampleProjectCommand);
  context.subscriptions.push(createSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
};
