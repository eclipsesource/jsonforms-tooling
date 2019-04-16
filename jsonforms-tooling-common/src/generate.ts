// tslint:disable:no-use-before-declare

import { generateDefaultUISchema } from '@jsonforms/core';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

import { MessageType, readFileWithPromise, showMessage, validateUiSchema, writeFileWithPromise } from './utils';

/**
 * Generates the default UI Schema from a json schema
 * @param {any} editorInstance the instance of the editor
 * @param {any} path the path to the schema file
 */
export const generateUISchema = async (editorInstance: any, path: any) => {
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
        id: 'selectSchema',
      });
      if (fileUri && fileUri[0].fsPath) {
        path = fileUri[0].fsPath;
      } else {
        throw new Error('Please select a json schema file');
      }
    } catch (err) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return err;
    }
  }

  // Read JSON Schema file
  let jsonContent = null;
  try {
    const content = await readFileWithPromise(path, 'utf8');
    jsonContent = JSON.parse(content);
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  // Check if file is already a uischema file and throw an error
  try {
    const validUiSchema = await validateUiSchema(jsonContent);
    if (validUiSchema) {
      throw new Error('It seems you selected a uischema. This functions does only work with a'
      + ' schema file');
    }
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  let fileName = '';
  try {
    fileName = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
      prompt: 'Label: ',
      placeHolder: 'Enter a filename for your UI Schema (default: uischema.json)',
      id: 'fileName',
    });
    if (fileName === undefined) {
      throw new Error('UI schema generation canceled');
    }
    if (fileName === '') {
      fileName = 'uischema.json';
    }
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  // Check if file already exist and ask user if it should be overwritten
  const newPath = join(dirname(path), fileName);
  if (existsSync(newPath)) {
    let decision = 'No';
    try {
      decision = await editorInstance.window.showQuickPick(['Yes', 'No'], editorInstance.QuickPickOptions = {
        canSelectMany: false,
        placeHolder:  `This file ${fileName} does already exist. Should it be overwritten?`,
        id: 'overwrite',
      });
      if (decision !== 'Yes') {
        throw new Error('UI schema generation canceled');
      }
    } catch (err) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return err;
    }
  }

  // Generate the default UI schema
  let jsonUISchema = null;
  try {
    jsonUISchema = await generateDefaultUISchema(jsonContent);
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }

  // Write UI Schema file
  try {
    await writeFileWithPromise(newPath, JSON.stringify(jsonUISchema, null, 2));
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }
  showMessage(editorInstance, 'Successfully generated UI schema');
  return jsonUISchema;
};
