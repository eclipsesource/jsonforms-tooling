import { generateUISchema } from '../src/generate';
import { editorInstance } from './assets/editorInstance';
import { join } from 'path';
import { readFileWithPromise, unlinkWithPromise } from '../src/utils';

/**
 * Test cases for the Tooling package.
 */

describe('Test generateUISchema', () => {
  let selectSchemaWasCalled = false;
  let enterFileNameWasCalled = false;
  let overwriteFileWasCalled = false;
  const basePath = join(__dirname, 'assets');

  const getEditor = (schemaPath: string) => {
    const random = Math.random().toString(36).substring(7);
    const uiSchemaName = 'uischema-test-' + random + '.json';

    selectSchemaWasCalled = false;
    enterFileNameWasCalled = false;
    overwriteFileWasCalled = false;

    const newEditorInstance = {
      ...editorInstance,
      window: {
        ...editorInstance.window,
        showInputBox: async (param: any) => {
          if (param.id === 'fileName') {
            enterFileNameWasCalled = true;
          return uiSchemaName;
          }
          return false;
        },
        showOpenDialog: async (param: any) => {
          if (param.id === 'selectSchema') {
            selectSchemaWasCalled = true;
            return [{fsPath: schemaPath}];
          }
          return false;
        },
        showQuickPick: async (options: any, param: any) => {
          if (param.id === 'overwrite') {
            overwriteFileWasCalled = true;
            return 'Yes';
          }
          return false;
        },
      },
      uiSchemaName,
    };
    return newEditorInstance;
  };

  test('Check if generated uischema matches correct uischema', async () => {
    const schemaPath = join(basePath, 'schema.json');
    const newEditorInstance = getEditor(schemaPath);
    await generateUISchema(newEditorInstance, schemaPath);

    const testFile = await readFileWithPromise(join(basePath, newEditorInstance.uiSchemaName), 'utf8');
    const actualFile = await readFileWithPromise(join(basePath, 'uischema.json'), 'utf8');
    expect(testFile).toBe(actualFile);

    await unlinkWithPromise(join(__dirname, 'assets', newEditorInstance.uiSchemaName));
  });

  test('Check if vscode inputs are shown correctly', async () => {
    const schemaPath = join(basePath, 'schema.json');
    const newEditorInstance = getEditor(schemaPath);
    await generateUISchema(newEditorInstance, schemaPath);

    expect(selectSchemaWasCalled).toBe(false);
    expect(enterFileNameWasCalled).toBe(true);
    expect(overwriteFileWasCalled).toBe(false);

    await unlinkWithPromise(join(__dirname, 'assets', newEditorInstance.uiSchemaName));
  });

  test('Check if overwrite file is asked', async () => {
    const schemaPath = join(basePath, 'schema.json');
    const newEditorInstance = getEditor(schemaPath);
    await generateUISchema(newEditorInstance, schemaPath);
    await generateUISchema(newEditorInstance, schemaPath);

    expect(selectSchemaWasCalled).toBe(false);
    expect(enterFileNameWasCalled).toBe(true);
    expect(overwriteFileWasCalled).toBe(true);

    await unlinkWithPromise(join(__dirname, 'assets', newEditorInstance.uiSchemaName));
  });

  test('Check if path is asked from the user, when not provided', async () => {
    const schemaPath = join(basePath, 'schema.json');
    const newEditorInstance = getEditor(schemaPath);
    await generateUISchema(newEditorInstance, '');

    expect(selectSchemaWasCalled).toBe(true);
    expect(enterFileNameWasCalled).toBe(true);
    expect(overwriteFileWasCalled).toBe(false);

    await unlinkWithPromise(join(__dirname, 'assets', newEditorInstance.uiSchemaName));
  });

  test('Check if an error is thrown, when file is uischema', async () => {
    const schemaPath = join(basePath, 'uischema.json');
    const newEditorInstance = getEditor(schemaPath);
    const result = await generateUISchema(newEditorInstance, schemaPath);

    expect(selectSchemaWasCalled).toBe(false);
    expect(enterFileNameWasCalled).toBe(false);
    expect(overwriteFileWasCalled).toBe(false);

    expect(result).toBeInstanceOf(Error);
  });
});
