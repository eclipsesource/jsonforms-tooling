// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { generateDefaultUISchema } from '@jsonforms/core';
import { readFile, writeFile } from 'fs';
import Ajv from 'ajv';
import { sep } from 'path';
const yeoman = require('yeoman-environment');

export enum Project {
  Example = 'example',
  Seed = 'seed',
}

/*
 * Receives the data from the editor and calls the install methos
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the arguments passed to the editor call
 * @param {string} project the project, that should be installed
 */
export const createProject = (editorInstance: any, path: string, project: string) => {
  if (!path) {
    editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: true,
      canSelectFiles: false,
      openLabel: 'Select folder',
    }).then((fileUri: any) => {
      if (fileUri && fileUri[0].fsPath) {
        asyncCreateProject(editorInstance, fileUri[0].fsPath, project);
      } else {
        showMessage(editorInstance, 'Please select a empty folder', 'err');
        return;
      }
    });
  } else {
    asyncCreateProject(editorInstance, path, project);
  }
};

/**
 * Generates the default UI Schema from a json schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the arguments passed to the editor call
 */
export const generateUISchema = (editorInstance: any, path: string) => {
  if (!path) {
    editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      canSelectFiles: true,
      openLabel: 'Select schema',
      filters: {
        'Json Files': ['json'],
      },
    }).then((fileUri: any) => {
      if (fileUri && fileUri[0].fsPath) {
        asyncGenerateUiSchema(editorInstance, fileUri[0].fsPath);
      } else {
        showMessage('Please select a json schema file', 'err');
        return;
      }
    });
  } else {
    asyncGenerateUiSchema(editorInstance, path);
  }
};

/**
 * Async Generate UI Schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
const asyncGenerateUiSchema = (editorInstance: any, path: string) => {
  editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a filename for your UI Schema (default: ui-schema.json)',
  }).then((name: string) => {
    let fileName = name;
    if (!fileName) {
      fileName = 'ui-schema.json';
    }
    showMessage(editorInstance, `Generating UI Schema: ${path}`);
    // Read JSON Schema file
    readFile(path, 'utf8', (readError, data) => {
      if (readError.message) {
        showMessage(editorInstance, readError.message, 'err');
        return;
      }

      const jsonSchema = JSON.parse(data);
      validateJSONSchema(jsonSchema, (validateError?: string) => {
        if (validateError) {
          showMessage(editorInstance, validateError, 'err');
          return;
        }

        const jsonUISchema = generateDefaultUISchema(jsonSchema);

        // Check if windows or linux filesystem
        let newPath = path.substring(0, path.lastIndexOf(sep));
        newPath = newPath + sep + name;

        // Write UI Schema file
        writeFile(newPath, JSON.stringify(jsonUISchema, null, 2), writeError => {
          if (writeError.message) {
            showMessage(editorInstance, writeError.message, 'err');
            return;
          }
          showMessage(editorInstance, 'Successfully generated UI schema');
        });
      });
    });
  });
};

/**
 * Validate a given JSON Schema
 * @param {Object} schema the json schema, that will be validated
 * @param {function} callback forwards the current status to the caller
 */
const validateJSONSchema = (schema: Object, callback: (err?: string) => void) => {
  const ajv = new Ajv();
  try {
    ajv.compile(schema);
    callback();
  } catch (error) {
    callback(error.message);
  }
};

/**
 * Show message within the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} message the message that should be displayed
 * @param {string} type the optional type of the message
 */
const showMessage = (editorInstance: any, message: string, type?: string) => {
  switch (type) {
    case 'err':
      editorInstance.window.showErrorMessage(message);
      break;
    case 'war':
      editorInstance.window.showWarningMessage(message);
      break;
    default:
      editorInstance.window.showInformationMessage(message);
  }
};

/**
 * Async Creating Project
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the project folder
 * @param {string} project the project, that will be created
 */
const asyncCreateProject = (editorInstance: any, path: string, project: string) => {

  if (project === Project.Example) {
    showMessage(editorInstance, `Creating example project: ${path}`);
    cloneAndInstall(editorInstance, project, path);
    return;
  }

  editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: `Enter a name for your ${project} project`,
  }).then((name: any) => {
    let projectName = name;
    if (!name) {
      projectName = `jsonforms-${project}`;
    } else {
      showMessage(editorInstance, `Creating ${project} project: ${path}`);
      cloneAndInstall(editorInstance, project, path, projectName);
    }
  });
};

/**
 * Async Clone And Install
 * @param {any} editorInstance the instance of the editor
 * @param {string} url the url to the project repository
 * @param {string} path the path to the project folder
 * @param {string} name the name of the project
 */
const cloneAndInstall = (editorInstance: any, project: string, path: string, name?: string) => {
  const env = yeoman.createEnv();
  env.on('error', (err: any) => {
    console.error('Error', err.message);
    process.exit(err.code);
  });
  env.lookup(() => {
    const options = {
      'project': project,
      'path': path,
      'name': name,
      'skipPrompting': true,
    };
    env.run('jsonforms', options, (err: any) => {
      if (err.message) {
        showMessage(editorInstance, `Error creating project:  ${err.message}`, 'err');
      } else {
        showMessage(editorInstance, `Done creating ${project} project`);
      }
    });
  });
};
