import { createProject, Project } from '../src/scaffolding';
import { editorInstance } from './assets/editorInstance';
import { join } from 'path';
import { mkdirWithPromise, readFileWithPromise, rimrafWithPromise, statWithPromise, validateUiSchema } from '../src/utils';

/**
 * Test cases for the Tooling package.
 */

describe('Test createProject with seed project', () => {
  // If project path needs to be selected manually
  let showOpenDialogWasCalled = false;
  // Enter project name
  let showInputBoxWasCalled = false;

  const random = Math.random().toString(36).substring(7);
  const path = join(__dirname, random);
  const srcPath = join(path, 'src');
  const projectName = 'test-project';

  const newEditorInstance = {
    ...editorInstance,
    window: {
      ...editorInstance.window,
      showInputBox: async (param: any) => {
        showInputBoxWasCalled = true;
        return projectName;
      },
      showOpenDialog: async (param: any) => {
        showOpenDialogWasCalled = true;
        return [{fsPath: path}];
      },
    },
  };

  beforeAll(async () => {
    jest.setTimeout(500000);
    await mkdirWithPromise(path);
    return createProject(newEditorInstance, '', Project.Seed);
  });

  afterAll(async () => {
    return rimrafWithPromise(path);
  });

  test('If path for project was asked', async () => {
    expect(showOpenDialogWasCalled).toBe(true);
  });

  test('If project name was asked', async () => {
    expect(showInputBoxWasCalled).toBe(true);
  });

  test('Check if package.json exists', async () => {
    expect(() => statWithPromise(join(path, 'package.json'))).not.toThrow();
  });

  test('Check if schema.json exists', async () => {
    expect(() => statWithPromise(join(srcPath, 'schema.json'))).not.toThrow();
  });

  test('Check if uischema.json exists', async () => {
    expect(() => statWithPromise(join(srcPath, 'uischema.json'))).not.toThrow();
  });

  test('Check if uischema is valid', async () => {
    let jsonContent = null;
    try {
      const content = await readFileWithPromise(join(srcPath, 'uischema.json'), 'utf8');
      jsonContent = JSON.parse(content);
    } catch (err) {
      return;
    }
    const isValidSchema = await validateUiSchema(jsonContent);
    expect(isValidSchema).toBe(true);
  });

  test('Check if project name is set correct', async () => {
    let jsonContent = null;
    try {
      const content = await readFileWithPromise(join(path, 'package.json'), 'utf8');
      jsonContent = JSON.parse(content);
    } catch (err) {
      return;
    }
    expect(jsonContent.name).toBe(projectName);
  });
});
