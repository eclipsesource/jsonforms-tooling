import { readdir, readFile, writeFile } from 'fs';
import Ajv from 'ajv';
import { promisify } from 'util';
import { uiMetaSchema } from './metaSchema';

export const readFileWithPromise = promisify(readFile);
export const readdirWithPromise = promisify(readdir);
export const writeFileWithPromise = promisify(writeFile);

export enum MessageType {
  Error = 'err',
  Warning = 'war',
  Information = 'info'
}

/**
 * Validate a given JSON Schema
 * @param {Object} schema the json schema, that will be validated
 * @param {function} callback forwards the current status to the caller
 */
export const validateUiSchema = async (schema: Object) => {
  try {
    const ajv = new Ajv();
    return ajv.validate(uiMetaSchema, schema);
  } catch (error) {
    throw(error.message);
  }
};

/**
 * Show message within the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} message the message that should be displayed
 * @param {string} type the optional type of the message
 */
export const showMessage = (editorInstance: any, message: string, type?: string) => {
  switch (type) {
    case MessageType.Error:
      editorInstance.window.showErrorMessage(message);
      break;
    case MessageType.Warning:
      editorInstance.window.showWarningMessage(message);
      break;
    default:
      editorInstance.window.showInformationMessage(message);
      break;
  }
};
