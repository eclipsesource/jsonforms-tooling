// tslint:disable:no-use-before-declare

import { generateDefaultUISchema } from '@jsonforms/core';
import { sep } from 'path';
import { existsSync } from 'fs';

import { readFileWithPromise, showMessage, writeFileWithPromise } from './utils';

/**
 * Generates the default UI Schema from a json schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
export const generateUISchema = async (editorInstance: any, path: string) => {
  if (!path) {
    let fileUri = null;
    try  {
      fileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'Json Files': ['json'],
        },
      });
      if (fileUri && fileUri[0].fsPath) {
        path = fileUri[0].fsPath;
      } else {
        showMessage(editorInstance, 'Please select a json schema file', 'err');
        return;
      }
    } catch (err) {
      return;
    }
  }
  asyncGenerateUiSchema(editorInstance, path);
};

/**
 * Async Generate UI Schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
const asyncGenerateUiSchema = async (editorInstance: any, path: string) => {
  // Ask for filename
  let fileName = '';
  try {
    fileName = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
      prompt: 'Label: ',
      placeHolder: 'Enter a filename for your UI Schema (default: uischema.json)',
    });
    if (fileName === undefined) {
      showMessage(editorInstance, 'UI schema generation canceled', 'err');
      return;
    }
    if (fileName === '') {
      fileName = 'uischema.json';
    }
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }

  // Check if file already exist and ask user if it should be overwritten
  const newPath = path.substring(0, path.lastIndexOf(sep)) + sep + fileName;
  if (existsSync(newPath)) {
    let decision = 'No';
    try {
      decision = await editorInstance.window.showQuickPick(['Yes', 'No'], editorInstance.QuickPickOptions = {
        canSelectMany: false,
        placeHolder:  `This file ${fileName} does already exist. Should it be overwritten?`
      });
      if (decision !== 'Yes') {
        showMessage(editorInstance, 'UI schema generation canceled', 'err');
        return;
      }
    } catch (err) {
      showMessage(editorInstance, 'UI schema generation canceled', 'err');
      return;
    }
  }

  // Read JSON Schema file
  let jsonContent = null;
  try {
    const content = await readFileWithPromise(path, 'utf8');
    jsonContent = JSON.parse(content);
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }

  // Generate the default UI schema
  const jsonUISchema = generateDefaultUISchema(jsonContent);

  // Write UI Schema file
  try {
    await writeFileWithPromise(newPath, JSON.stringify(jsonUISchema, null, 2));
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }
  showMessage(editorInstance, 'Successfully generated UI schema');
};
