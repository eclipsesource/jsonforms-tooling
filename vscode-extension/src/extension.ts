'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const tooling = require('jsonforms-tooling');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const createExampleProject = vscode.commands.registerCommand('extension.createExampleProject', (args: any) => {
    if (!args) {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
      };
      vscode.window.showOpenDialog(options).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          asyncCreateExampleProject(fileUri[0].fsPath);
        } else {
          showMessage('Please select a empty folder', 'err');
          return;
        }
      });
    } else {
      asyncCreateExampleProject(args.fsPath);
    }
  });

  const createSeedProject = vscode.commands.registerCommand('extension.createSeedProject', (args: any) => {
    if (!args) {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
      };
      vscode.window.showOpenDialog(options).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          asyncCreateSeedProject(fileUri[0].fsPath);
        } else {
          showMessage('Please select a empty folder', 'err');
          return;
        }
      });
    } else {
      asyncCreateSeedProject(args.fsPath);
    }
  });

  const generateUISchema = vscode.commands.registerCommand('extension.generateUISchema', (args: any) => {
    if (!args) {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'Json Files': ['json'],
        },
      };
      vscode.window.showOpenDialog(options).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          asyncGenerateUiSchema(fileUri[0].fsPath);
        } else {
          showMessage('Please select a json schema file', 'err');
          return;
        }
      });
    } else {
      asyncGenerateUiSchema(args.fsPath);
    }
  });

  context.subscriptions.push(createExampleProject);
  context.subscriptions.push(createSeedProject);
  context.subscriptions.push(generateUISchema);
}

/**
 * Async Creating Example Project
 * @param {string} path the path to the project folder
 */
function asyncCreateExampleProject(path: string) {
  showMessage(`Creating example project: ${path}`);
  tooling.cloneAndInstall('example', path, (result: string, type: string) => {
    showMessage(result, type);
  });
}

/**
 * Async Creating Seed Project
 * @param {string} path the path to the project folder
 */
function asyncCreateSeedProject(path: string) {
  const options: vscode.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a name for your seed project',
  };
  vscode.window.showInputBox(options).then((name) => {
    let projectName = name;
    if (!name) {
      projectName = 'jsonforms-seed';
    }
    showMessage(`Creating seed project: ${path}`);
    tooling.cloneAndInstall('seed', path, (result: string, type: string) => { showMessage(result, type); }, projectName);
  });
}

/**
 * Async Generate UI Schema
 * @param {string} path the path to the project folder
 */
function asyncGenerateUiSchema(path: string) {
  const options: vscode.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a filename for your UI Schema (default: ui-schema.json)',
  };
  vscode.window.showInputBox(options).then((name) => {
    let fileName = name;
    if (!name) {
      fileName = 'ui-schema.json';
    }
    showMessage(`Generating UI Schema: ${path}`);
    tooling.generateUISchema(path, fileName, (result: string, type: string) => {
      showMessage(result, type);
    });
  });
}

/**
 * Show Visual Studio Code Message
 * @param {string} message the message that should be displayed
 * @param {string} type the type of the message
 */
function showMessage(message: string, type?: string) {
  switch (type) {
    case 'err':
      vscode.window.showErrorMessage(message);
      break;
    case 'war':
      vscode.window.showWarningMessage(message);
      break;
    default:
      vscode.window.showInformationMessage(message);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
