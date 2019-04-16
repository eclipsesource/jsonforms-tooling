// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'fs';
import Ajv from 'ajv';
import { promisify } from 'util';
const rimraf = require('rimraf');

import { uiMetaSchema } from './metaSchema';

export const statWithPromise = promisify(stat);
export const mkdirWithPromise = promisify(mkdir);
export const readdirWithPromise = promisify(readdir);
export const readFileWithPromise = promisify(readFile);
export const unlinkWithPromise = promisify(unlink);
export const writeFileWithPromise = promisify(writeFile);
export const rimrafWithPromise = promisify(rimraf);

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
export const showMessage = async (editorInstance: any, message: string, type?: string) => {
  let result = null;
  switch (type) {
    case MessageType.Error:
      result = editorInstance.window.showErrorMessage(message);
      break;
    case MessageType.Warning:
      result = editorInstance.window.showWarningMessage(message);
      break;
    default:
      result = editorInstance.window.showInformationMessage(message);
      break;
  }
  return result;
};
