import * as simplegit from 'simple-git/promise';
import * as child from 'child_process';

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