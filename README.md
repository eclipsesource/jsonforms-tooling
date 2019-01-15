# JSONForms Tooling

Make it easier for developers to use [JSONForms](https://github.com/eclipsesource/jsonforms)

## Continuous Integration
The JSONForms project is build and tested via [Travis](https://travis-ci.org/). Coverage is documented by [Coveralls](https://coveralls.io).

Current status: [![Build Status](https://travis-ci.org/eclipsesource/jsonforms-tooling.svg?branch=master)](https://travis-ci.org/eclipsesource/jsonforms-tooling) [![Coverage Status](https://coveralls.io/repos/eclipsesource/jsonforms-tooling/badge.svg?branch=master&service=github)](https://coveralls.io/github/eclipsesource/jsonforms-tooling?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/eclipsesource/jsonforms-tooling.svg)](https://greenkeeper.io/)

## Getting started

To get started, you just need to run the following commands:
```
npm install
```
This will install all dependecies for the `theia-plugin`, the `vscode-extension` and the `tooling` package. 
It will also run the `lerna bootstrap` and the `lerna postinstall` command.

To compile the code in all packages, just run 
```
npm run compile
```

For more information on each package, please read the  README of those packages.

## License
The JSONForms project is licensed under the MIT License. See the [LICENSE file](https://github.com/eclipsesource/jsonforms-tooling/blob/master/LICENSE) for more information.
