import * as vscode from 'vscode';
import { createProject, generateUISchema, showPreview } from 'jsonforms-tooling-common';

export const activate = (context: vscode.ExtensionContext) => {

  const scaffoldSeedProjectCommand = vscode.commands.registerCommand(
    'extension.scaffoldSeedProject',
    (args: any) => {
      if (args === undefined) {
        args = {fsPath: null};
      }
      createProject(vscode, args.fsPath);
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

  context.subscriptions.push(scaffoldSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
  context.subscriptions.push(showPreviewCommand);
};
