// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { join } from 'path';
const TerminalAdapter = require('yeoman-environment/lib/adapter');
const yeoman = require('yeoman-environment');

import { MessageType, readdirWithPromise, showMessage } from './utils';

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
      if (fileUri && fileUri[0].fsPath) {
        path = fileUri[0].fsPath;
      } else {
        throw new Error('Please select a empty folder');
      }
    } catch (err) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return err;
    }
  }

  try {
    const files = await readdirWithPromise(path);
    if (files.length) {
      throw new Error('Folder not empty. Please select an empty folder.');
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
  // Ask for schema path (only for scaffolding project)
  let schemaPath = '';
  try {
    schemaPath = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
      prompt: 'Label: ',
      placeHolder: `Enter the path to your schema file (leave blank to use default schema)`,
      id: 'schemaPath',
    });
  } catch (err) {
    showMessage(editorInstance, err.message, 'err');
    return err;
  }
  showMessage(editorInstance, `Scaffolding Seed project: ${path}`);

  // Create yeoman environment and call yeoman generator
  const env = yeoman.createEnv([], {}, new ToolingAdapter( {editorInstance} ));
  const generatorDir = join(__dirname, '../node_modules/generator-jsonforms/generators/app/index.js');
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
    showMessage(this.editorInstance, msg);
  };
}
