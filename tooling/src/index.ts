import * as simplegit from 'simple-git/promise';
import * as child from 'child_process';
import * as jsonforms from '@jsonforms/core';
import { writeFile, readFile } from 'fs';

/**
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
            child.exec(`cd /${path} | npm install`, (error, stdout, stderr) => {
                if (error) {
                    callback(`exec error: ${error}`, 'err');
                    return;
                }
                callback(`stdout: ${stdout}`);
                callback(`stderr: ${stderr}`, 'err');
            });
        })
        .catch((err: any) => {callback(err.message, 'err')});
}

/**
export function generateUISchema(path: string, callback: (result: string, type?: string) => void) {
    readFile(path, 'utf8', (err, data) => {
        if (err) callback(err.message, 'err');
        var content = JSON.parse(data);
        var jsonSchema = jsonforms.generateJsonSchema(content);
        var jsonUISchema = jsonforms.generateDefaultUISchema(jsonSchema);
        var newPath = removeLastPathElement(path);
        writeFile(newPath+'\\ui-schema.json', JSON.stringify(jsonUISchema,null, 2), (err) => {
            if (err) callback(err.message, 'err');
            callback('Successfully generated UI schema');
        });
    });
}

function removeLastPathElement(path: string) {
    var newPath = path.split('\\');
    newPath.pop();
    return newPath.join('\\');
}