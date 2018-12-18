// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';
const tooling = require('jsonforms-tooling');

export const start = (context: theia.PluginContext) => {
  const createExampleProjectCommand = {
    id: 'create-example-project',
    label: 'JSONForms: Create Example Project',
  };
  const createExampleProject = theia.commands.registerCommand(
    createExampleProjectCommand,
    (args: any) => {
    const type = 'example';
    if (!args) {
      asyncCreateProjectWithArgs(type);
    } else {
      asyncCreateProject(args.fsPath, type);
    }
  });

  const createSeedProjectCommand = {
    id: 'create-seed-project',
    label: 'JSONForms: Create Seed Project',
  };
  const createSeedProject = theia.commands.registerCommand(
    createSeedProjectCommand,
    (args: any) => {
    const type = 'seed';
    if (!args) {
      asyncCreateProjectWithArgs(type);      
    } else {
      asyncCreateProject(args.fsPath, type);
    }
  });

  const createBasicProjectCommand = {
    id: 'create-basic-project',
    label: 'JSONForms: Create Basic Project',
  };
  const createBasicProject = theia.commands.registerCommand(
    createBasicProjectCommand,
    (args: any) => {
      const type = 'basic';
      if (!args) {
        asyncCreateProjectWithArgs(type);
      } else {
        asyncCreateProject(args.fsPath, type);
      }
  });

  const generateUISchemaCommand = {
    id: 'generate-ui-schema',
    label: 'JSONForms: Generate UI Schema',
  };
  const generateUISchema = theia.commands.registerCommand(
    generateUISchemaCommand,
    (args: any) => {
    if (!args) {
      const options: theia.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'Json Files': ['json'],
        },
      };
      theia.window.showOpenDialog(options).then(fileUri => {
        if (fileUri && fileUri[0].fsPath) {
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
  context.subscriptions.push(createBasicProject);
  context.subscriptions.push(generateUISchema);
};

/**
 * Async Creating Project
 * @param {string} path the path to the project folder
 * @param {string} type the path to the project folder
 */
const asyncCreateProject = (path: string, type: string) => {

  if(type === 'example'){
    showMessage(`Creating example project: ${path}`);
    tooling.cloneAndInstall(type, path, (result: string, type: string) => {
      showMessage(result, type);
    },
    'jsonforms-example');
    return;
  }

  const options: theia.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: `Enter a name for your ${type} project`,
  };
  theia.window.showInputBox(options).then(name => {
    let projectName = name;
    if (!name) {
      projectName = `jsonforms-${type}`;
    }
    if(type === 'basic') {
      const endpointInputOptions: theia.InputBoxOptions = {
        prompt: 'Label: ',
        placeHolder: `Enter an OpenAPI endpoint for your ${type} project.`,
      };
      theia.window.showInputBox(endpointInputOptions).then(endpoint => {
        // const apiEndpoint = new URL(endpoint || '');
        showMessage(`Creating bla ${type} project: ${path}`);
        tooling.cloneAndInstall(
            type,
            path,
            (result: string, type: string) => { showMessage(result, type); },
            projectName
        );
      });
    } else {
      showMessage(`Creating ${type} project: ${path}`);
      tooling.cloneAndInstall(
        type,
        path,
        (result: string, type: string) => { showMessage(result, type); },
        projectName
      );
    }
  });
};

/**
 * Async Generate UI Schema
 * @param {string} path the path to the project folder
 */
const asyncGenerateUiSchema = (path: string) => {
  const options: theia.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a filename for your UI Schema (default: ui-schema.json)',
  };
  theia.window.showInputBox(options).then(name => {
    let fileName = name;
    if (!name) {
      fileName = 'jsonforms-seed';
    }
    showMessage(`Generating UI Schema: ${path}`);
    tooling.generateUISchema(path, fileName, (result: string, type: string) => {
      showMessage(result, type);
    });
  });
};

/**
 * Show Theia Message
 * @param {string} message the message that should be displayed
 * @param {string} type the type of the message
 */
const showMessage = (message: string, type?: string) => {
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
};

/**
 * Set up project with options. 
 * @param {string} type : Type of project to set up.
 */
const asyncCreateProjectWithArgs = (type: string) => {
  const options: theia.OpenDialogOptions = {
    canSelectMany: false,
    canSelectFolders: true,
    canSelectFiles: false,
    openLabel: 'Select folder',
  };
  theia.window.showOpenDialog(options).then(fileUri => {
    if (fileUri && fileUri[0].fsPath) {
      asyncCreateProject(fileUri[0].fsPath, type);
    } else {
      showMessage('Please select a empty folder', 'err');
      return;
    }
  });

};
