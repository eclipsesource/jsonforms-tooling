'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-extension" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let createExampleProject = vscode.commands.registerCommand('extension.createExampleProject', (args: any) => {
        // The code you place here will be executed every time your command is executed
        let path = (args) ? args.path : "";
        // Display a message box to the user
        vscode.window.showInformationMessage('Creating example project: '+path);
    });

    let createSeedProject = vscode.commands.registerCommand('extension.createSeedProject', (args: any) => {
        // The code you place here will be executed every time your command is executed
        let path = (args) ? args.path : "";
        // Display a message box to the user
        vscode.window.showInformationMessage('Creating seed project: '+path);
    });

    let generateUISchema = vscode.commands.registerCommand('extension.generateUISchema', (args: any) => {
        // The code you place here will be executed every time your command is executed
        let path = (args) ? args.path : "";
        // Display a message box to the user
        vscode.window.showInformationMessage('Generating UI Schema: '+path);
    });

    context.subscriptions.push(createExampleProject);
    context.subscriptions.push(createSeedProject);
    context.subscriptions.push(generateUISchema);
}

// this method is called when your extension is deactivated
export function deactivate() {
}