// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { generateDefaultUISchema } from '@jsonforms/core';
import { existsSync, readFile, writeFile } from 'fs';
import Ajv from 'ajv';
import { join, sep } from 'path';
import { watch } from 'chokidar';
import { promisify } from 'util';
const yeoman = require('yeoman-environment');

export enum Project {
  Example = 'example',
  Seed = 'seed',
}

const readFileWithPromise = promisify(readFile);
const writeFileWithPromise = promisify(writeFile);

/*
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path for the project
 * @param {string} project the project, that should be installed
 */
export const createProject = async (editorInstance: any, path: string, project: string) => {
  if (!path) {
    let fileUri = null;
    try  {
      fileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
      });
      if (fileUri && fileUri[0].fsPath) {
        path = fileUri[0].fsPath;
      } else {
        showMessage(editorInstance, 'Please select a empty folder', 'err');
        return;
      }
    } catch (err) {
      return;
    }
  }
  asyncCreateProject(editorInstance, path, project);
};

/**
 * Generates the default UI Schema from a json schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
export const generateUISchema = async (editorInstance: any, path: string) => {
  if (!path) {
    let fileUri = null;
    try  {
      fileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'Json Files': ['json'],
        },
      });
      if (fileUri && fileUri[0].fsPath) {
        path = fileUri[0].fsPath;
      } else {
        showMessage('Please select a json schema file', 'err');
        return;
      }
    } catch (err) {
      return;
    }
  }
  asyncGenerateUiSchema(editorInstance, path);
};

/**
 * Shows a preview form of a given json schema and ui schema in a new panel inside the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema or ui-schema file
 * @param {string} extensionPath the path to the extension directory
 */
export const showPreview = async (editorInstance: any, firstSchemafileUri: any, extensionPath: string) => {
  // Set default strings
  let uiSchemaOrSchema = 'Schema';
  let selectSecondSchema = 'Select UI Schema';
  let selectSecondErrorMessage = 'Please select a ui schema file';

  // If the function is not called with a right click on a json file, we need to ask for both files
  if (!firstSchemafileUri) {
    try {
      firstSchemafileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select schema',
        filters: {
          'Json Files': ['json'],
        },
      });
      firstSchemafileUri = firstSchemafileUri[0].fsPath;
    } catch (err) {
      showMessage('Please select a schema file', 'err');
      return;
    }
  } else {
    // If the user called this function by doing a right click on a json file, we need to know which schema file that was
    try {
      uiSchemaOrSchema = await editorInstance.window.showQuickPick(['Schema', 'UI Schema'], editorInstance.QuickPickOptions = {
        canSelectMany: false,
        placeHolder: 'Was that the schema or the UI schema file?'
      });
      if (uiSchemaOrSchema === 'UI Schema') {
        selectSecondSchema = 'Select Schema';
        selectSecondErrorMessage = 'Please select a schema file';
      }
    } catch (err) {
      showMessage('Please select the schema type', 'err');
      return;
    }
  }
  // In both situations we still need the second schema file
  let secondSchemafileUri = null;
  try {
    secondSchemafileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      canSelectFiles: true,
      openLabel: selectSecondSchema,
      filters: {
        'Json Files': ['json'],
      },
    });
    secondSchemafileUri = secondSchemafileUri[0].fsPath;
  } catch (err) {
    showMessage(selectSecondErrorMessage, 'err');
    return;
  }
  let uiSchemaPath = firstSchemafileUri;
  let schemaPath = secondSchemafileUri;
  if (uiSchemaOrSchema === 'Schema') {
    uiSchemaPath = secondSchemafileUri;
    schemaPath = firstSchemafileUri;
  }
  showWebview(editorInstance, 'preview', extensionPath, uiSchemaPath, schemaPath);
};

/**
 * Async Generate UI Schema
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema file
 */
const asyncGenerateUiSchema = async (editorInstance: any, path: string) => {
  // Ask for filename
  let fileName = '';
  try {
    fileName = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
      prompt: 'Label: ',
      placeHolder: 'Enter a filename for your UI Schema (default: uischema.json)',
    });
    if (fileName === undefined) {
      showMessage(editorInstance, 'UI schema generation canceled', 'err');
      return;
    }
    if (fileName === '') {
      fileName = 'uischema.json';
    }
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }

  showMessage(editorInstance, `Generating UI Schema: ${path}`);

  // Read JSON Schema file
  let content = '';
  try {
    content = await readFileWithPromise(path, 'utf8');
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }

  // Check if JSON is valid
  const jsonSchema = JSON.parse(content);
  try {
    validateJSONSchema(jsonSchema);
  } catch (err) {
    showMessage(editorInstance, err, 'err');
    return;
  }

  // Generate the default UI schema
  const jsonUISchema = generateDefaultUISchema(jsonSchema);

  const newPath = path.substring(0, path.lastIndexOf(sep)) + sep + fileName;

  // Check if file already exist and ask user if it should be overwritten
  if (existsSync(newPath)) {
    let decision = 'No';
    try {
      decision = await editorInstance.window.showQuickPick(['Yes', 'No'], editorInstance.QuickPickOptions = {
        canSelectMany: false,
        placeHolder:  `This file ${fileName} does already exist. Should it be overwritten?`
      });
      if (decision !== 'Yes') {
        showMessage(editorInstance, 'UI schema generation canceled', 'err');
        return;
      }
    } catch (err) {
      showMessage(editorInstance, 'UI schema generation canceled', 'err');
      return;
    }
  }

  // Write UI Schema file
  try {
    await writeFileWithPromise(newPath, JSON.stringify(jsonUISchema, null, 2));
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }
  showMessage(editorInstance, 'Successfully generated UI schema');
};

/**
 * Validate a given JSON Schema
 * @param {Object} schema the json schema, that will be validated
 * @param {function} callback forwards the current status to the caller
 */
const validateJSONSchema = (schema: Object) => {
  try {
    const ajv =  new Ajv();
    ajv.compile(schema);
    return true;
  } catch (error) {
    throw(error.message);
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
const asyncCreateProject = async (editorInstance: any, path: string, project: string) => {
  let projectName = '';
  if (project !== Project.Example) {
    try {
      projectName = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
        prompt: 'Label: ',
        placeHolder: `Enter a name for your ${project} project (default: jsonforms-${project})`,
      });
      if (projectName === '') {
        projectName = `jsonforms-${project}`;
      }
    } catch (err) {
      showMessage(editorInstance, err.message, 'err');
      return;
    }
  }
  showMessage(editorInstance, `Creating ${project} project: ${path}`);
  cloneAndInstall(editorInstance, project, path, projectName);
};

/**
 * Async Clone And Install
 * @param {any} editorInstance the instance of the editor
 * @param {string} url the url to the project repository
 * @param {string} path the path to the project folder
 * @param {string} name the name of the project
 */
const cloneAndInstall = async (editorInstance: any, project: string, path: string, name?: string) => {
  const env = yeoman.createEnv();
  env.on('error', (err: any) => {
    showMessage(editorInstance, err.message, 'err');
    process.exit(err.code);
  });
  const options = {
    env,
    'project': project,
    'path': path,
    'name': name,
    'skipPrompting': true,
  };
  await env.lookup();
  try {
    await env.run('jsonforms', options);
  } catch (err) {
    showMessage(editorInstance, `Error creating project: ${err.message}`, 'err');
    return;
  }
  showMessage(editorInstance, `Done creating ${project} project`);
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
const showWebview = async (
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
  let html = await preparePreview(editorInstance, extensionPath, uiSchemaPath, schemaPath);
  webView.webview.html = html;
  watch(uiSchemaPath).on('change', async (event: any, path: any) => {
    html = await preparePreview(editorInstance, extensionPath, uiSchemaPath, schemaPath);
    webView.webview.html = html;
  });
};

/**
 * Prepare the preview webview
 * @param {any} editorInstance the instance of the editor
 * @param {string} extensionPath the path to the extension directory
 * @param {string} uiSchemaPath the path to the ui schema
 * @param {string} schemaPath the path to the schema
 */
const preparePreview = async (
  editorInstance: any,
  extensionPath: string,
  uiSchemaPath: string,
  schemaPath: string
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
  let schema = '';
  try {
    schema = await readFileWithPromise(schemaPath, 'utf8');
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }
  let uiSchema = '';
  try {
    uiSchema = await readFileWithPromise(uiSchemaPath, 'utf8');
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return;
  }
  const html = getPreviewHTML(scriptUriCore, scriptUriReact, scriptUriMaterial, schema, uiSchema);
  return html;
};
