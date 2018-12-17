// tslint:disable:no-use-before-declare

import * as Ajv from 'ajv';
import * as cp from 'child_process';
import * as jsonforms from '@jsonforms/core';
import * as simplegit from 'simple-git/promise';
import { get } from 'https';
import { readFile, writeFile } from 'fs';
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
    case 'basic':
      url = 'https://github.com/roxhens/example-project';
      break;
    case 'seed':
      url = 'https://github.com/eclipsesource/jsonforms-react-seed';
      break;
    default:
      return;
  }
  const git = simplegit();
  callback('start-cloning', 'Starting to clone repo');
  path += sep + name;
  git.clone(url, path)
    .then(() => {
      callback('finished-cloning', 'Finished to clone repo');
      /**
       * TODO: refactor basic app
       */
      if(repo === 'basic') {
        // TODO: Dynamically set API
        const API = 'https://api.swaggerhub.com/apis/jsonforms-tooling/JSONForms-Tooling-API/1.0.0';
        get(API, (response) => {
          response.setEncoding('utf-8');
          response.on('data', (schema) => {
              callback('generating-ui-schema', 'Generating the UI Schema file...');
              const jsonSchema = JSON.parse(schema).components.schemas.Applicant;
              // Construct local path
              const jsonUISchemaPath = `${path + sep + 'src' + sep}jsonUISchema.json`;
              // Generate .json file
              generateJSONUISchemaFile(jsonUISchemaPath, jsonSchema, (message?: string) => {
                if (message) {
                  callback('Message', message);
                  return;
                }
              });
          });
        }).on("error", (err) => {
          callback('error', err.message, 'err');
        });
      }
      // Continue to dependency installations
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

/**
 * Generate file containing JSON UI Schema.
 * @param path {string} : Path to which the file will be saved.
 * @param jsonSchema {any} : Valid JSON Schema to generate the UI Schema from.
 * @param callback {function} : Callback to pass informational message.
 */
const generateJSONUISchemaFile = (path: string, jsonSchema: any, callback: (err?: string) => void) => {
  // Validate if content is valid JSON
  validateJSONSchema(jsonSchema, (validateError?: string) => {
    if (validateError) {
      callback(validateError);
      return;
    }
    // Generate UI Schema
    const jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);
    // Generate file inside project
    writeFile(path, JSON.stringify(jsonUISchema, null, 2), 'utf-8', 
      (error) => {
        if (error.message) {
          callback(error.message);
          return;
        }
        callback('Successfully generated the UI Schema file!');
      }
    );
  });
};
