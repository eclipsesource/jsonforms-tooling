// tslint:disable:no-use-before-declare

import * as simplegit from 'simple-git/promise';
import * as jsonforms from '@jsonforms/core';
import * as cp from 'child_process';
import { readFile, writeFile } from 'fs';
import * as Ajv from 'ajv';
import { sep } from 'path';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/*
 * Clones a git repository and runs npm install on it
 * @param {string} repo the name of the repo that should be cloned
 * @param {string} path to the folder, where the repo should be cloned into
 * @param {function} callback forwards the current status to the caller
 */
export const cloneAndInstall = (
  repo: string,
  path: string,
  callback: (id: string, result: string, type?: string) => void,
  name?: string) => {
  let url = '';
  switch (repo) {
    case 'example':
      url = 'https://github.com/eclipsesource/make-it-happen-react';
      break;
    case 'seed':
      url = 'https://github.com/eclipsesource/jsonforms-react-seed';
      break;
    default:
      return;
  }
  const git = simplegit();
  callback('start-cloning', 'Starting to clone repo');
  git.clone(url, path)
    .then(() => {
      callback('finished-cloning', 'Finished to clone repo');
      callback('npm-install', 'Running npm install');
      const result = cp.spawnSync(npm, ['install'], {
        cwd: path,
      });
      callback('signal', result.signal);
    })
    .catch((err: any) => { callback('error', err.message, 'err'); });
};

/**
 * Generates the default UI Schema from a json schema
 * @param {string} path path to the json schema file
 * @param {function} callback forwards the current status to the caller
 */
export const generateUISchema = (
  path: string,
  name: string,
  callback: (id: string, result: string, type?: string) => void) => {
  // Read JSON Schema file
  readFile(path, 'utf8', (readError, data) => {
    if (readError.message) {
      callback('error', readError.message, 'err');
      return;
    }

    const jsonSchema = JSON.parse(data);
    validateJSONSchema(jsonSchema, (validateError?: string) => {
      if (validateError) {
        callback('error', validateError, 'err');
        return;
      }

      const jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);

      // Check if windows or linux filesystem
      let newPath = path.substring(0, path.lastIndexOf(sep));
      newPath = newPath + sep + name;

      // Write UI Schema file
      writeFile(newPath, JSON.stringify(jsonUISchema, null, 2), writeError => {
        if (writeError.message) {
          callback('error', writeError.message, 'err');
          return;
        }
        callback('success', 'Successfully generated UI schema');
      });
    });
  });
};

/**
 * Validate a given JSON Schema
 * @param {string} path path to the json schema file
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
