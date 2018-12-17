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
  git.clone(url, path)
    .then(() => {
      callback('finished-cloning', 'Finished to clone repo');

      /**
       * TODO: refactor basic app
       */
      if(repo === "basic") {
        // TODO: Dynamically set API
        const API = 'https://api.swaggerhub.com/apis/jsonforms-tooling/JSONForms-Tooling-API/1.0.0';
        get(API, (response) => {
          response.setEncoding('utf-8');
          response.on('data', (schema) => {
              callback('generating-ui-schema', 'Generating the UI Schema file...');
              let jsonUISchema = JSON.parse(schema);
              jsonUISchema = jsonUISchema.components.schemas.Applicant;
              jsonUISchema = jsonforms.generateDefaultUISchema(jsonUISchema);
            
              writeFile(
                path + sep + 'src' + sep + 'jsonUISchema.json',
                JSON.stringify(jsonUISchema), 'utf-8', 
                (err) => {
                  if (err) 
                    throw err;
                  callback('generated-ui-schema','Successfully generated the UI Schema file!');
                }
              );
          });

        }).on("error", (err) => {
          callback('error', err.message, 'err');
        });
      }

      callback('npm-install', 'Running npm install');
      const result = cp.spawnSync(npm, ['install'], {
        cwd: path,
      });
      callback('signal', result.signal);
    })
    .catch((err: any) => { callback('error', err.message, 'err'); });
};





      /**
       * TODO: refactor basic app
       */
      // if(repo === "basic") {
        // callback('generating-ui-schema', 'Generating the UI Schema file...');
        // TODO: Dynamically set API
        // const API = 'https://api.swaggerhub.com/apis/jsonforms-tooling/JSONForms-Tooling-API/1.0.0';
        // get(API, (response) => {
          // let data = '';
          // A chunk of data has been recieved.
          // response.on('data', (chunk) => {
            // data += chunk;
          // });
  
          // The whole response has been received. Print out the result.
          // response.on('end', () => {
            // callback('success-data', JSON.parse(data), 'err');
            // const json = JSON.parse(data);
            // const schema = json.components.Applicant;
            // const jsonUISchema = jsonforms.generateDefaultUISchema(schema);
  
            // TODO: Refactor
            // Check if windows or linux filesystem
            // const newPath = path.substring(0, path.lastIndexOf(sep)) + sep + "src" + sep + "UITester.json";
  
            // Write UI Schema file
            // writeFile(newPath, JSON.stringify(jsonUISchema, null, 2), writeError => {
            // writeFile(path, "JSON.stringify(jsonUISchema, null, 2)", writeError => {
            //   if (writeError.message) {
            //     callback('error', writeError.message, 'err');
            //     return;
            //   }
            //   callback('success', 'Successfully generated UI schema');
            // });
            
          // });
        // }).on("error", (err) => {
          // callback('error', err.message, 'err');
        // });

      // }









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
