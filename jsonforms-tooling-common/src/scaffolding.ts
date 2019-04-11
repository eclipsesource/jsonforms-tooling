// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
// tslint:disable:no-use-before-declare

import { join } from 'path';
const TerminalAdapter = require('yeoman-environment/lib/adapter');
const yeoman = require('yeoman-environment');

import { MessageType, readdirWithPromise, showMessage } from './utils';

export enum Project {
  Example = 'example',
  Seed = 'seed',
  Scaffolding = 'scaffolding'
}

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
        showMessage(editorInstance, 'Please select a empty folder', MessageType.Error);
        return;
      }
    } catch (err) {
      return;
    }
  }

  try {
    const files = await readdirWithPromise(path);
    if (files.length) {
      throw new Error('Folder not empty. Please select an empty folder.');
    }
  } catch (err) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }
  // Ask for project name
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
      showMessage(editorInstance, err.message, MessageType.Error);
      return;
    }
  }
  // Ask for schema path (only for scaffolding project)
  let schemaPath = '';
  if (project === Project.Scaffolding) {
    try {
      schemaPath = await editorInstance.window.showInputBox(editorInstance.InputBoxOptions = {
        prompt: 'Label: ',
        placeHolder: `Enter the path or url to your schema file`,
      });
      if (schemaPath === '' || schemaPath === undefined) {
        throw new Error('The schema path is missing, process terminated');
      }
    } catch (err) {
      showMessage(editorInstance, err.message, 'err');
      return;
    }
  }
  showMessage(editorInstance, `Creating ${project} project: ${path}`);

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
    'project': project,
    'path': path,
    'name': projectName,
    'schemaPath': schemaPath,
    'skipPrompting': true,
  };
  try {
    await env.run('jsonforms', options);
  } catch (err) {
    showMessage(editorInstance, `Error creating project: ${err.message}`, MessageType.Error);
    return;
  }
  showMessage(editorInstance, `Done creating ${project} project`);
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
