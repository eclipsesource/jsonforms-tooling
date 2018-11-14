import * as simplegit from 'simple-git/promise';
import * as child from 'child_process';
import * as jsonforms from '@jsonforms/core';
import { writeFile, readFile } from 'fs';

export function cloneAndInstall(repo: String, path: string) {
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
    console.log('Starting to clone repo');
    git.clone(url, path)
    .then(function() {
        console.log('Finished to clone repo');
        console.log('Running npm install');
        child.exec('cd /${path} && npm install', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
    })
    .catch((err: any) => console.error('failed: ', err));
}

export function generateUISchema(path: string) {
    readFile(path, 'utf8', (err, data) => {
        if (err) throw err;
        var content = JSON.parse(data);
        var jsonSchema = jsonforms.generateJsonSchema(content);
        var jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);
        var newPath = removeLastPathElement(path);
        writeFile(newPath+'\\ui-schema.json', JSON.stringify(jsonUISchema,null, 2), (err) => {
            if (err) throw err;
        });
    });
}

function removeLastPathElement(path: string) {
    var newPath = path.split('\\');
    newPath.pop();
    return newPath.join('\\');
}