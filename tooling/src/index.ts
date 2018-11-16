import * as simplegit from 'simple-git/promise';
import * as jsonforms from '@jsonforms/core';
import * as cp from 'child_process';
import { writeFile, readFile } from 'fs';
var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/*
 * Clones a git repository and runs npm install on it
 * @param {string} repo the name of the repo that should be cloned
 * @param {string} path to the folder, where the repo should be cloned into
 * @param {function} callback forwards the current status to the caller
 */
export function cloneAndInstall(repo: String, path: string, callback: (result: string, type?: string) => void) {
    var url = '';
    switch(repo) {
        case 'example':
            url = 'https://github.com/eclipsesource/make-it-happen-react';
            break;
        case 'seed':
            url = 'https://github.com/eclipsesource/jsonforms-react-seed';
            break;
    }
    const git = simplegit();
    callback('Starting to clone repo');
    git.clone(url, path)
        .then(function() {
            callback('Finished to clone repo');
            callback('Running npm install');
            const result = cp.spawnSync( npm, ['install'], {
                cwd: path
            }); 
            callback(result.signal); 
        })
        .catch((err: any) => {callback(err.message, 'err')});
}

/**
 * Generates the default UI Schema from a json schema
 * @param {string} path path to the json schema file
 * @param {function} callback forwards the current status to the caller
 */
export function generateUISchema(path: string, callback: (result: string, type?: string) => void) {
    readFile(path, 'utf8', (err, data) => {
        if (err) callback(err.message, 'err');
        var jsonSchema = JSON.parse(data);
        var jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);
        if(process.platform === 'win32') {
            var newPath = path.substring(0, path.lastIndexOf("\\"))+'\\ui-schema.json';
        } else {
            var newPath = path.substring(0, path.lastIndexOf("/"))+'/ui-schema.json';
        }
        writeFile(newPath, JSON.stringify(jsonUISchema,null, 2), (err) => {
            if (err) callback(err.message, 'err');
            callback('Successfully generated UI schema');
        });
    });
}
