/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
import { createProject, generateUISchema, Project, showPreview } from 'jsonforms-tooling-common';

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

  const showPreviewCommandOptions = {
    id: 'show-preview',
    label: 'JSONForms: Show Preview',
  };
  const showPreviewCommand = theia.commands.registerCommand(
    showPreviewCommandOptions,
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      showPreview(theia, args.fsPath, context.extensionPath);
    }
  );

  context.subscriptions.push(createExampleProjectCommand);
  context.subscriptions.push(createSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
  context.subscriptions.push(showPreviewCommand);
};
