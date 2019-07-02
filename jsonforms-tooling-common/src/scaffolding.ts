// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { join } from 'path';
const TerminalAdapter = require('yeoman-environment/lib/adapter');
const yeoman = require('yeoman-environment');

import { MessageType, readdirWithPromise, showMessage, statWithPromise } from './utils';

/*
 * @param {any} editorInstance the instance of the editor
 * @param {string} path the path for the project
 * @param {string} project the project, that should be installed
 */
export const createProject = async (editorInstance: any, path: string) => {
  if (!path) {
    let fileUri = null;
    try  {
      fileUri = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select folder',
        id: 'path',
      });
      path = fileUri[0].fsPath;
    } catch (err) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return err;
    }
  }

  // Check if folder is empty
  try {
    const files = await readdirWithPromise(path);
    if (files.length) {
      showMessage(editorInstance, 'Folder not empty. Please select an empty folder.', MessageType.Error);
      return;
    }
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  // Ask for project name
  let projectName = '';
  try {
    projectName = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
      prompt: 'Label: ',
      placeHolder: `Enter a name for your seed project (default: jsonforms-react-seed)`,
      id: 'projectName',
    });
    if (projectName === '') {
      projectName = `jsonforms-react-seed`;
    }
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  // Check if file already exist and ask user if it should be overwritten
  let whichSchema = 'Default';
  try {
    whichSchema = await editorInstance.window.showQuickPick(['Default', 'Custom'], editorInstance.QuickPickOptions = {
      canSelectMany: false,
      placeHolder:  `Do you want to use the default schema or a custom schema?`,
      id: 'whichSchema',
    });
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return err;
  }

  // Ask for schema path
  let schemaPath = null;
  if (whichSchema === 'Custom') {
    try {
      schemaPath = await editorInstance.window.showOpenDialog(editorInstance.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select the custom schema file',
        defaultUri: editorInstance.Uri.parse(path),
        filters: {
          'Json Files': ['json'],
        },
        id: 'schemaPath',
      });
      schemaPath = schemaPath[0].fsPath;
    } catch (err) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return err;
    }
  }

  if (schemaPath == null) {
    schemaPath = '';
  }

  showMessage(editorInstance, `Scaffolding Seed project: ${path}`);

  // Create yeoman environment and call yeoman generator
  const env = yeoman.createEnv([], {}, new ToolingAdapter( {editorInstance} ));
  const generatorPath = '../node_modules/generator-jsonforms/generators/app/index.js';
  let generatorDir = join(__dirname, generatorPath);
  try {
    await statWithPromise(generatorDir);
  } catch (err) {
    generatorDir = join(__dirname, '../../', generatorPath);
  }
  env.getByPath(generatorDir);
  env.on('error', (err: any) => {
    showMessage(editorInstance, err.message, MessageType.Error);
    process.exit(err.code);
  });
  const options = {
    env,
    'path': path,
    'name': projectName,
    'schemaPath': schemaPath,
    'skipPrompting': true,
  };
  try {
    await env.run('jsonforms', options);
  } catch (err) {
    showMessage(editorInstance, `Error creating project: ${err.message}`, MessageType.Error);
    return err;
  }
  showMessage(editorInstance, `Done scaffolding the seed project`);
  return true;
};

class ToolingAdapter extends TerminalAdapter {
  editorInstance: any;

  constructor(args: any) {
    super();
    this.editorInstance = args.editorInstance;
  }

  log = (msg: any, ctx: any) => {
    if (ctx === 'err') {
      showMessage(this.editorInstance, msg, MessageType.Error);
    } else {
      showMessage(this.editorInstance, msg);
    }
  };
}
