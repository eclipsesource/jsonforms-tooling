
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
const tooling = require('jsonforms-tooling');

export function start(context: theia.PluginContext) {
  const createExampleProjectCommand = {
    id: 'create-example-project',
    label: 'Create Example Project',
  };
  const createExampleProject = theia.commands.registerCommand(createExampleProjectCommand, (args: any) => {
    if (!args) {
      const options: theia.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
      };
      theia.window.showOpenDialog(options).then((fileUri) => {
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

  const createSeedProjectCommand = {
    id: 'create-seed-project',
    label: 'Create Seed Project',
  };
  const createSeedProject = theia.commands.registerCommand(createSeedProjectCommand, (args: any) => {
    if (!args) {
      const options: theia.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
      };
      theia.window.showOpenDialog(options).then((fileUri) => {
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

  const generateUISchemaCommand = {
    id: 'generate-ui-schema',
    label: 'Generate UI Schema',
  };
  const generateUISchema = theia.commands.registerCommand(generateUISchemaCommand, (args: any) => {
    if (!args) {
      const options: theia.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'JSON files': ['json'],
        },
      };
      theia.window.showOpenDialog(options).then((fileUri) => {
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

export function stop() {

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
  const options: theia.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a name for your seed project',
  };
  theia.window.showInputBox(options).then((name) => {
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
  const options: theia.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a filename for your UI Schema (default: ui-schema.json)',
  };
  theia.window.showInputBox(options).then((name) => {
    let fileName = name;
    if (!name) {
      fileName = 'jsonforms-seed';
    }
    showMessage(`Generating UI Schema: ${path}`);
    tooling.generateUISchema(path, fileName, (result: string, type: string) => {
      showMessage(result, type);
    });
  });
}

/**
 * Show Theia Message
 * @param {string} message the message that should be displayed
 * @param {string} type the type of the message
 */
function showMessage(message: string, type?: string) {
  switch (type) {
    case 'err':
      theia.window.showErrorMessage(message);
      break;
    case 'war':
      theia.window.showWarningMessage(message);
      break;
    default:
      theia.window.showInformationMessage(message);
  }
}
