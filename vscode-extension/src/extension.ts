'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var tooling = require('jsonforms-tooling');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let createExampleProject = vscode.commands.registerCommand('extension.createExampleProject', (args: any) => {
        if(!args) {
            vscode.window.showInformationMessage('You can only run this on a folder');
            return;
        } else {
            let path = args.fsPath;
            vscode.window.showInformationMessage('Creating example project: '+path);
            tooling.cloneAndInstall('example', path);
        }
    });

    let createSeedProject = vscode.commands.registerCommand('extension.createSeedProject', (args: any) => {
        if(!args) {
            vscode.window.showInformationMessage('You can only run this on a folder');
            return;
        } else {
            let path = args.fsPath;
            vscode.window.showInformationMessage('Creating seed project: '+path);
            tooling.cloneAndInstall('seed', path);
        }
    });

    let generateUISchema = vscode.commands.registerCommand('extension.generateUISchema', (args: any) => {
        if(!args) {
            vscode.window.showInformationMessage('You can only run this on a json file');
            return;
        } else {
            let path = args.fsPath;
            vscode.window.showInformationMessage('Generating UI Schema: '+path);
            tooling.generateUISchema(path);
        }
    });

    context.subscriptions.push(createExampleProject);
    context.subscriptions.push(createSeedProject);
    context.subscriptions.push(generateUISchema);
}

// this method is called when your extension is deactivated
export function deactivate() {
}