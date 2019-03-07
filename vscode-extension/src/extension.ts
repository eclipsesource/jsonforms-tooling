import * as vscode from 'vscode';
import { createProject, generateUISchema, Project, showPreview } from 'jsonforms-tooling-common';

export const activate = (context: vscode.ExtensionContext) => {

  const createExampleProjectCommand = vscode.commands.registerCommand(
    'extension.createExampleProject',
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      createProject(vscode, args.fsPath, Project.Example);
    }
  );

  const createSeedProjectCommand = vscode.commands.registerCommand(
    'extension.createSeedProject',
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      createProject(vscode, args.fsPath, Project.Seed);
    }
  );

  const generateUISchemaCommand = vscode.commands.registerCommand(
    'extension.generateUISchema',
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      generateUISchema(vscode, args.fsPath);
  });

  const showPreviewCommand = vscode.commands.registerCommand(
    'extension.showPreview',
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      showPreview(vscode, args.fsPath, context.extensionPath);
  });

  context.subscriptions.push(createExampleProjectCommand);
  context.subscriptions.push(createSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
  context.subscriptions.push(showPreviewCommand);
};
