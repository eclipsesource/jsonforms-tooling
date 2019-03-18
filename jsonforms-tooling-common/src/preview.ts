// tslint:disable:no-use-before-declare

import { watch } from 'chokidar';
import { join } from 'path';

import { MessageType, readFileWithPromise, showMessage, validateUiSchema } from './utils';

/**
 * Shows a preview form of a given json schema and ui schema in a new panel inside the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path to the schema or ui-schema file
 * @param {string} extensionPath the path to the extension directory
 */
export const showPreview = async (editorInstance: any, firstSchemafileUri: any, extensionPath: string) => {
  // Set default strings
  let uiSchemaOrSchema = 'Schema';
  let otherSchema = 'UI Schema';
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
      showMessage('Please select a schema file', MessageType.Error);
      return;
    }
  } else {
    // If the user called this function by doing a right click on a json file, we need to know which schema file that was
    try {
      const schemaContent = await readFileWithPromise(firstSchemafileUri, 'utf8');
      const parsedSchemaContent = JSON.parse(schemaContent);
      const validUiSchema = await validateUiSchema(parsedSchemaContent);
      if (validUiSchema) {
        uiSchemaOrSchema = 'UI Schema';
        otherSchema = 'Schema';
        selectSecondSchema = 'Select Schema';
        selectSecondErrorMessage = 'Please select a schema file';
      }
    } catch (err) {
      showMessage(err.message, MessageType.Error);
      return;
    }
  }
  // In both situations we still need the second schema file
  // First we'll tell the user what to do next
  try {
    await editorInstance.window.showQuickPick(['Next'], editorInstance.QuickPickOptions = {
      canSelectMany: false,
      placeHolder: `You've selected a ${uiSchemaOrSchema} file. Continue by selecting a ${otherSchema} file.`
    });
  } catch (err) {
    showMessage(err.message, MessageType.Error);
    return;
  }
  // Now he can select the file
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
    showMessage(selectSecondErrorMessage, MessageType.Error);
    return;
  }
  let uiSchemaPath = firstSchemafileUri;
  let schemaPath = secondSchemafileUri;
  if (uiSchemaOrSchema === 'Schema') {
    uiSchemaPath = secondSchemafileUri;
    schemaPath = firstSchemafileUri;
  }
  showWebview(editorInstance, 'preview', 'JSONForms Preview', extensionPath, uiSchemaPath, schemaPath);
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
  <title>JSONForms Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/react@16.4.0/umd/react.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@16.4.0/umd/react-dom.development.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/redux@3.7.2/dist/redux.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-redux@6.0.0/dist/react-redux.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/babel-core@5.6.15/browser.min.js"></script>
  <script src="${scriptUriCore}"></script>
  <script src="${scriptUriReact}"></script>
  <script src="${scriptUriMaterial}"></script>
  <style>
    body {
      background: #fff;
      padding: 0;
    }
    #root {
      padding: 20px;
      overflow-x: hidden;
    }
    .loading {
      width: 100vw;
      height: 100vh;
      background: #333333;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: -20px;
    }
    .loader,
    .loader:after {
      border-radius: 50%;
      width: 10em;
      height: 10em;
    }
    .loader {
      margin: 60px auto;
      font-size: 10px;
      position: relative;
      text-indent: -9999em;
      border-top: 1.1em solid rgba(255, 255, 255, 0.2);
      border-right: 1.1em solid rgba(255, 255, 255, 0.2);
      border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
      border-left: 1.1em solid #ffffff;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: load8 1.1s infinite linear;
      animation: load8 1.1s infinite linear;
    }
    @-webkit-keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>
  <div id="root">
    <div class="loading">
      <div class="loader"></div>
      <h3>The preview is now loading. When loading for the first time, this process takes a while.</h3>
    </div>
  </div>
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
        <JSONFormsReact.JsonForms />
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
  name: string,
  extensionPath: string,
  uiSchemaPath: string,
  schemaPath: string
) => {
  const webView = editorInstance.window.createWebviewPanel(
    'view-' + id,
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
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }
  let uiSchema = '';
  try {
    uiSchema = await readFileWithPromise(uiSchemaPath, 'utf8');
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }
  const html = getPreviewHTML(scriptUriCore, scriptUriReact, scriptUriMaterial, schema, uiSchema);
  return html;
};
