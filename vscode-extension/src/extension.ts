'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createProject, generateUISchema, Project } from 'jsonforms-tooling-common';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = (context: vscode.ExtensionContext) => {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const createScaffoldingProjectCommand = vscode.commands.registerCommand(
    'extension.createScaffoldingProject',
    (args: any) => {
      createProject(vscode, args.fsPath, Project.Scaffolding);
    }
  );

  const createExampleProjectCommand = vscode.commands.registerCommand(
    'extension.createExampleProject',
    (args: any) => {
      createProject(vscode, args.fsPath, Project.Example);
    }
  );

  const createSeedProjectCommand = vscode.commands.registerCommand(
    'extension.createSeedProject',
    (args: any) => {
      createProject(vscode, args.fsPath, Project.Seed);
    }
  );

  const generateUISchemaCommand = vscode.commands.registerCommand(
    'extension.generateUISchema',
    (args: any) => {
      generateUISchema(vscode, args.fsPath);
  });

  context.subscriptions.push(createScaffoldingProjectCommand);
  context.subscriptions.push(createExampleProjectCommand);
  context.subscriptions.push(createSeedProjectCommand);
  context.subscriptions.push(generateUISchemaCommand);
};
