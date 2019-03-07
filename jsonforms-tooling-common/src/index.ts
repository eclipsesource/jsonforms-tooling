// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { generateDefaultUISchema } from '@jsonforms/core';
import { readFile, writeFile } from 'fs';
import Ajv from 'ajv';
import { join, sep } from 'path';
import { watch } from 'chokidar';
const yeoman = require('yeoman-environment');

export enum Project {
  Example = 'example',
  Seed = 'seed',
}

/*
 * Receives the data from the editor and calls the install methos
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the arguments passed to the editor call
 * @param {string} project the project, that should be installed
 */
export const createProject = (editorInstance: any, path: string, project: string) => {
  if (!path) {
    editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: true,
      canSelectFiles: false,
      openLabel: 'Select folder',
    }).then((fileUri: any) => {
      if (fileUri && fileUri[0].fsPath) {
        asyncCreateProject(editorInstance, fileUri[0].fsPath, project);
      } else {
        showMessage(editorInstance, 'Please select a empty folder', 'err');
        return;
      }
    });
  } else {
    asyncCreateProject(editorInstance, path, project);
  }
};

/**
 * Generates the default UI Schema from a json schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the arguments passed to the editor call
 */
export const generateUISchema = (editorInstance: any, path: string) => {
  if (!path) {
    editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      canSelectFiles: true,
      openLabel: 'Select schema',
      filters: {
        'Json Files': ['json'],
      },
    }).then((fileUri: any) => {
      if (fileUri && fileUri[0].fsPath) {
        asyncGenerateUiSchema(editorInstance, fileUri[0].fsPath);
      } else {
        showMessage('Please select a json schema file', 'err');
        return;
      }
    });
  } else {
    asyncGenerateUiSchema(editorInstance, path);
  }
};

/**
 * Shows a preview form of a given json schema and ui schema in a new panel inside the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema or ui-schema file
 * @param {string} extensionPath the path to the extension directory
 */
export const showPreview = (editorInstance: any, path: any, extensionPath: string) => {
  if (!path) {
    editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      canSelectFiles: true,
      openLabel: 'Select ui schema',
      filters: {
        'Json Files': ['json'],
      },
    }).then((uiSchemafileUri: any) => {
      if (uiSchemafileUri && uiSchemafileUri[0].fsPath) {
        editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
          canSelectMany: false,
          canSelectFolders: false,
          canSelectFiles: true,
          openLabel: 'Select schema',
          filters: {
            'Json Files': ['json'],
          },
        }).then((schemaFileUri: any) => {
          if (schemaFileUri && schemaFileUri[0].fsPath) {
            const uiSchemaPath = uiSchemafileUri[0].fsPath;
            const schemaPath = schemaFileUri[0].fsPath;
            showWebview(editorInstance, 'preview', extensionPath, uiSchemaPath, schemaPath);
          } else {
            showMessage('Please select a json schema file', 'err');
            return;
          }
        });
      } else {
        showMessage('Please select a ui schema file', 'err');
        return;
      }
    });
  } else {
    editorInstance.window.showQuickPick(['UI Schema', 'Schema'], editorInstance.QuickPickOptions = {
      canSelectMany: false,
      placeHolder: 'Was that the UI schema or the schema file?'
    }).then((schema: any) => {
      if (schema) {
        let selectLabel = 'Select ui Schema';
        if (schema === 'UI Schema') {
          selectLabel = 'Select Schema';
        }
        editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
          canSelectMany: false,
          canSelectFolders: false,
          canSelectFiles: true,
          openLabel: selectLabel,
          filters: {
            'Json Files': ['json'],
          },
        }).then((schemaFileUri: any) => {
          if (schemaFileUri && schemaFileUri[0].fsPath) {
            if (schema === 'UI Schema') {
              showWebview(editorInstance, 'preview', extensionPath, path, schemaFileUri[0].fsPath);
            } else {
              showWebview(editorInstance, 'preview', extensionPath, schemaFileUri[0].fsPath, path);
            }
          } else {
            showMessage('Please select a json schema file', 'err');
            return;
          }
        });
      } else {
        showMessage('Please select the schema type', 'err');
        return;
      }
    });
  }
};

/**
 * Async Generate UI Schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
const asyncGenerateUiSchema = (editorInstance: any, path: string) => {
  editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: 'Enter a filename for your UI Schema (default: ui-schema.json)',
  }).then((name: string) => {
    let fileName = name;
    if (!fileName) {
      fileName = 'ui-schema.json';
    }
    showMessage(editorInstance, `Generating UI Schema: ${path}`);
    // Read JSON Schema file
    readFile(path, 'utf8', (readError, data) => {
      if (readError.message) {
        showMessage(editorInstance, readError.message, 'err');
        return;
      }

      const jsonSchema = JSON.parse(data);
      validateJSONSchema(jsonSchema, (validateError?: string) => {
        if (validateError) {
          showMessage(editorInstance, validateError, 'err');
          return;
        }

        const jsonUISchema = generateDefaultUISchema(jsonSchema);

        // Check if windows or linux filesystem
        let newPath = path.substring(0, path.lastIndexOf(sep));
        newPath = newPath + sep + name;

        // Write UI Schema file
        writeFile(newPath, JSON.stringify(jsonUISchema, null, 2), writeError => {
          if (writeError.message) {
            showMessage(editorInstance, writeError.message, 'err');
            return;
          }
          showMessage(editorInstance, 'Successfully generated UI schema');
        });
      });
    });
  });
};

/**
 * Validate a given JSON Schema
 * @param {Object} schema the json schema, that will be validated
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
 * Show message within the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} message the message that should be displayed
 * @param {string} type the optional type of the message
 */
const showMessage = (editorInstance: any, message: string, type?: string) => {
  switch (type) {
    case 'err':
      editorInstance.window.showErrorMessage(message);
      break;
    case 'war':
      editorInstance.window.showWarningMessage(message);
      break;
    default:
      editorInstance.window.showInformationMessage(message);
  }
};

/**
 * Async Creating Project
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the project folder
 * @param {string} project the project, that will be created
 */
const asyncCreateProject = (editorInstance: any, path: string, project: string) => {

  if (project === Project.Example) {
    showMessage(editorInstance, `Creating example project: ${path}`);
    cloneAndInstall(editorInstance, project, path);
    return;
  }

  editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
    prompt: 'Label: ',
    placeHolder: `Enter a name for your ${project} project`,
  }).then((name: any) => {
    let projectName = name;
    if (!name) {
      projectName = `jsonforms-${project}`;
    } else {
      showMessage(editorInstance, `Creating ${project} project: ${path}`);
      cloneAndInstall(editorInstance, project, path, projectName);
    }
  });
};

/**
 * Async Clone And Install
 * @param {any} editorInstance the instance of the editor
 * @param {string} url the url to the project repository
 * @param {string} path the path to the project folder
 * @param {string} name the name of the project
 */
const cloneAndInstall = (editorInstance: any, project: string, path: string, name?: string) => {
  const env = yeoman.createEnv();
  env.on('error', (err: any) => {
    console.error('Error', err.message);
    process.exit(err.code);
  });
  env.lookup(() => {
    const options = {
      'project': project,
      'path': path,
      'name': name,
      'skipPrompting': true,
    };
    env.run('jsonforms', options, (err: any) => {
      if (err.message) {
        showMessage(editorInstance, `Error creating project:  ${err.message}`, 'err');
      } else {
        showMessage(editorInstance, `Done creating ${project} project`);
      }
    });
  });
};

/**
 * Get HTML to be shown inside the preview webview
 * @param {any} scriptUriCore Uri of jsonforms-core.js
 * @param {any} scriptUriReact Uri of jsonforms-react.js
 * @param {any} scriptUriMaterial Uri of jsonforms-material.js
 * @param {JSON} schema schema of the form
 * @param {JSON} uiSchema uiSchema of the form
 */
const getPreviewHTML = (
  scriptUriCore: any,
  scriptUriReact: any,
  scriptUriMaterial: any,
  schema: string,
  uiSchema: string
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdn.jsdelivr.net/npm/react@16.4.0/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@16.4.0/umd/react-dom.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/redux@3.7.2/dist/redux.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-redux@6.0.0/dist/react-redux.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/babel-core@5.6.15/browser.min.js"></script>
  <script src="${scriptUriCore}"></script>
  <script src="${scriptUriReact}"></script>
  <script src="${scriptUriMaterial}"></script>
</head>

<body style="background: #fff">
    <div id="root">Loading...</div>
    <script type="text/babel">
    var schema = ${schema};
    var uiSchema = ${uiSchema};

  const store = Redux.createStore(
      Redux.combineReducers({ jsonforms: JSONFormsCore.jsonformsReducer() }),
      {
          jsonforms: {
              fields: JSONFormsMaterial.materialFields,
              renderers: JSONFormsMaterial.materialRenderers
          },
      }
  );

  store.dispatch(JSONFormsCore.Actions.init({}, schema, uiSchema));
  const mapStateToProps = state => {
    return { dataAsString: JSON.stringify(JSONFormsCore.getData(state), null, 2) }
  };
  var App = ({ dataAsString }) => {
      return (
        <div>
          <JSONFormsReact.JsonForms />
        </div>
      );
  };

  const CApp = ReactRedux.connect(mapStateToProps, null)(App);

  ReactDOM.render(
      <ReactRedux.Provider store={store}>
          <CApp />
      </ReactRedux.Provider>,
      document.getElementById('root')
  );
</script>
</body>
</html>`;
};

/**
 * Show webview
 * @param {any} editorInstance the instance of the editor
 * @param {string} id the id for the webview
 * @param {string} extensionPath the path to the extension directory
 * @param {string} uiSchemaPath the path to the ui schema
 * @param {string} schemaPath the path to the schema
 */
const showWebview = (
  editorInstance: any,
  id: string,
  extensionPath: string,
  uiSchemaPath: string,
  schemaPath: string
) => {
  const name = id;
  const webView = editorInstance.window.createWebviewPanel(
    'view-' + name,
    name,
    editorInstance.ViewColumn.Two,
    { enableScripts: true}
  );
  preparePreview(editorInstance, extensionPath, uiSchemaPath, schemaPath, (html: string) => {
    webView.webview.html = html;
    watch(uiSchemaPath).on('change', (event: any, path: any) => {
      preparePreview(editorInstance, extensionPath, uiSchemaPath, schemaPath, (newHtml: string) => {
        webView.webview.html = newHtml;
      });
    });
  });
};

/**
 * Prepare the preview webview
 * @param {any} editorInstance the instance of the editor
 * @param {string} extensionPath the path to the extension directory
 * @param {string} uiSchemaPath the path to the ui schema
 * @param {string} schemaPath the path to the schema
 * @param {any} callback the callback, that is called, after all files are loaded
 */
const preparePreview = (
  editorInstance: any,
  extensionPath: string,
  uiSchemaPath: string,
  schemaPath: string,
  callback: any
) => {
  // Prepare the scripts needed to show the App inside the Webview
  const scriptPathOnDiskCore = editorInstance.Uri.file(
    join(extensionPath, 'assets', 'preview', 'jsonforms-core.js')
  );
  const scriptPathOnDiskReact = editorInstance.Uri.file(
    join(extensionPath, 'assets', 'preview', 'jsonforms-react.js')
  );
  const scriptPathOnDiskMaterial = editorInstance.Uri.file(
    join(extensionPath, 'assets', 'preview', 'jsonforms-material.js')
  );
  const scriptUriCore = scriptPathOnDiskCore.with({ scheme: 'vscode-resource'});
  const scriptUriReact = scriptPathOnDiskReact.with({ scheme: 'vscode-resource'});
  const scriptUriMaterial = scriptPathOnDiskMaterial.with({ scheme: 'vscode-resource'});

  // Read json files and load html for webview
  readFile(schemaPath, 'utf8', (readError, schema) => {
    if ((readError !== null) && readError.message) {
      showMessage(editorInstance, readError.message, 'err');
      return;
    }
    readFile(uiSchemaPath, 'utf8', (secondReadError, uiSchema) => {
      if ((secondReadError !== null) && secondReadError.message) {
        showMessage(editorInstance, secondReadError.message, 'err');
        return;
      }
      callback(getPreviewHTML(scriptUriCore, scriptUriReact, scriptUriMaterial, schema, uiSchema));
    });
  });
};
