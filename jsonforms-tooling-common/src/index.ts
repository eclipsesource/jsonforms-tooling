// tslint:disable:no-use-before-declare

import * as Ajv from 'ajv';
import * as cp from 'child_process';
import * as jsonforms from '@jsonforms/core';
import * as simplegit from 'simple-git/promise';
import { URL } from 'url';
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
  callback: (result: string, type?: string) => void,
  name?: string,
  endpoint?: URL
) => {
  let url = '';
  switch (repo) {
    case 'example':
      url = 'https://github.com/eclipsesource/make-it-happen-react';
      break;
    case 'basic':
      url = 'https://github.com/roxhens/jsonforms-basic-project';
      break;
    case 'seed':
      url = 'https://github.com/eclipsesource/jsonforms-react-seed';
      break;
    default:
      return;
  }
  const git = simplegit();
  callback('Starting to clone repo');
  path += sep + name;
  git.clone(url, path)
    .then(() => {
      callback('Finished to clone repo');
      if(repo === 'basic') {
        if(!endpoint){
          callback('Not a valid API endpoint.', 'err');
          return;
        }
        retrieveAndSaveJSONUISchemaFromAPI(repo, path, endpoint, callback);
      }
      // Continue to dependency installations
      callback('npm-install', 'Running npm install');
      const result = cp.spawnSync(npm, ['install'], {
        cwd: path,
      });
      callback('signal', result.signal);
    })
    .catch((err: any) => { callback(err.message, 'err'); });
};

/**
 * Generates the default UI Schema from a json schema
 * @param {string} path path to the json schema file
 * @param {function} callback forwards the current status to the caller
 */
export const generateUISchema = (
  path: string,
  name: string,
  callback: (result: string, type?: string) => void) => {
  // Read JSON Schema file
  readFile(path, 'utf8', (readError, data) => {
    if (readError.message) {
      callback(readError.message, 'err');
      return;
    }

    const jsonSchema = JSON.parse(data);
    validateJSONSchema(jsonSchema, (validateError?: string) => {
      if (validateError) {
        callback(validateError, 'err');
        return;
      }

      const jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);

      // Check if windows or linux filesystem
      let newPath = path.substring(0, path.lastIndexOf(sep));
      newPath = newPath + sep + name;

      // Write UI Schema file
      writeFile(newPath, JSON.stringify(jsonUISchema, null, 2), writeError => {
        if (writeError.message) {
          callback(writeError.message, 'err');
          return;
        }
        callback('Successfully generated UI schema');
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

/**
 * Function to retrieve OpenAPI definition from endpoint and get the JSON UI Schema
 * from it to save it in JSON format.
 * @param {string} repo the name of the repo that should be cloned.
 * @param {string} path to the folder, where the repo should be cloned into.
 * @param {URL} endpoint to the OpenAPI definition.
 */
const retrieveAndSaveJSONUISchemaFromAPI = (
  repo: string, 
  path: string, 
  endpoint: URL, 
  callback: (result: string, type?: string) => void
) => {
  callback(`Getting endpoint for ${repo} project.`);
  var reqOptions = {
    host : endpoint.hostname,
    path:  endpoint.pathname,
    json: true,
    headers: {
        "content-type": "text/json"
    },
  } 
  get(reqOptions, (response) => {
    response.setEncoding('utf-8');
    response.on('data', (schema) => {
      callback('Generating the UI Schema file...');
      const schemaObj = JSON.parse(schema);
      const jsonSchema = schemaObj.components.schemas.Applicant;
      // Construct paths
      const srcPath = path + sep + 'src' + sep;
      const jsonUISchemaPath = srcPath + 'json-ui-schema.json';
      const constsPath = srcPath + 'vars.js';
      // Create .js file with constants
      const obj = 'const ENDPOINT = \'' + endpoint + '\'; export default ENDPOINT;';
      writeFile(constsPath, obj, 'utf-8', 
        (error) => {
          if (error.message) {
            callback('error', error.message);
            return;
          }
          callback('Successfully generated endpoint!');
        }
      );
      // Generate .json file
      generateJSONUISchemaFile(jsonUISchemaPath, jsonSchema, (message?: string) => {
        if (message) {
          callback('message', message);
          return;
        }
      });
    });
  }).on("error", (err) => {
    callback(err.message, 'err');
    console.log(err.message);
  });
};