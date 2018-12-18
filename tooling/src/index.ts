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
  callback: (id: string, result: string, type?: string) => void,
  name?: string,
  endpoint?: URL
) => {
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
      if(repo === 'basic') {
        if(!endpoint){
          callback('api-endpoint-error', 'Not a valid API endpoint.', 'err');
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
  callback: (id: string, result: string, type?: string) => void
) => {
  callback('information', `Getting endpoint for ${repo} project.`);

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
      callback('generating-ui-schema', 'Generating the UI Schema file...');
      // const jsonSchema = JSON.parse(schema).components.schemas.Applicant;
      const openAPIJSON = JSON.parse(schema);      
      // Construct local path
      const openAPIJSONPath = `${path + sep + 'src' + sep}openAPI-definition.json`;
      // Generate .json file inside project
      writeFile(openAPIJSONPath, JSON.stringify(openAPIJSON, null, 2), 'utf-8', 
        (error) => {
          if (error.message) {
            callback('error', error.message);
            return;
          }
          callback('success', 'Successfully generated the openAPI .json definition file!');
        }
      );
    });
  }).on("error", (err) => {
    callback('error', err.message, 'err');
    console.log(err.message);
  });
};