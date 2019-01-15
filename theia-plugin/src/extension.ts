/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
import { createProject, generateUISchema, Project } from 'jsonforms-tooling-common';

export const start = (context: theia.PluginContext) => {
  const createExampleProjectCommandOptions = {
    id: 'create-example-project',
    label: 'JSONForms: Create Example Project',
  };
  const createExampleProjectCommand = theia.commands.registerCommand(
    createExampleProjectCommandOptions,
    (args: any) => {
      if (!args) {
        createProject(theia, args.fsPath, Project.Example);
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
      createProject(theia, args.fsPath, Project.Seed);
    }
  );

  const generateUISchemaCommandOptions = {
    id: 'generate-ui-schema',
    label: 'JSONForms: Generate UI Schema',
  };
  const generateUISchemaCommand = theia.commands.registerCommand(
    generateUISchemaCommandOptions,
    (args: any) => {
      generateUISchema(theia, args.fsPath);
    }
  );

  context.subscriptions.push(createExampleProjectCommand);
  context.subscriptions.push(createSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
};
