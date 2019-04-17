import { createProject } from '../src/scaffolding';
import { editorInstance } from './assets/editorInstance';
import { join } from 'path';
import { mkdirWithPromise, readFileWithPromise, rimrafWithPromise, statWithPromise, validateUiSchema } from '../src/utils';

/**
 * Test cases for the Tooling package.
 */

describe('Test createProject with default schema', () => {
  let selectPathWasCalled = false;
  let enterProjectNameWasCalled = false;
  let enterSchemaPathWasCalled = false;

  const random = Math.random().toString(36).substring(7);
  const path = join(__dirname, random);
  const srcPath = join(path, 'src');
  const projectName = 'test-project';

  const newEditorInstance = {
    ...editorInstance,
    window: {
      ...editorInstance.window,
      showInputBox: async (param: any) => {
        if (param.id === 'projectName') {
          enterProjectNameWasCalled = true;
          return projectName;
        } else if (param.id === 'schemaPath') {
          enterSchemaPathWasCalled = true;
          return '';
        }
        return false;
      },
      showOpenDialog: async (param: any) => {
        if (param.id === 'path') {
          selectPathWasCalled = true;
        return [{fsPath: path}];
        }
        return false;
      },
    },
  };

  beforeAll(async () => {
    jest.setTimeout(500000);
    await mkdirWithPromise(path);
    return createProject(newEditorInstance, '');
  });

  afterAll(async () => {
    return rimrafWithPromise(path);
  });

  test('If path for project was asked', async () => {
    expect(selectPathWasCalled).toBe(true);
  });

  test('If project name was asked', async () => {
    expect(enterProjectNameWasCalled).toBe(true);
  });

  test('If schema path was asked', async () => {
    expect(enterSchemaPathWasCalled).toBe(true);
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

  test('Check if uischema is valid', async (done: any) => {
    let jsonContent = null;
    try {
      const content = await readFileWithPromise(join(srcPath, 'uischema.json'), 'utf8');
      jsonContent = JSON.parse(content);
    } catch (err) {
      done.fail(new Error('File could not be read'));
    }
    const isValidSchema = await validateUiSchema(jsonContent);
    expect(isValidSchema).toBe(true);
    done();
  });

  test('Check if project name is set correct', async (done: any) => {
    let jsonContent = null;
    try {
      const content = await readFileWithPromise(join(path, 'package.json'), 'utf8');
      jsonContent = JSON.parse(content);
    } catch (err) {
      done.fail(new Error('File could not be read'));
    }
    expect(jsonContent.name).toBe(projectName);
    done();
  });
});

describe('Test createProject with custom schema', () => {
  let selectPathWasCalled = false;
  let enterProjectNameWasCalled = false;
  let enterSchemaPathWasCalled = false;

  const random = Math.random().toString(36).substring(7);
  const path = join(__dirname, random);
  const srcPath = join(path, 'src');
  const projectName = 'test-project-2';
  const schemaPath = join(__dirname, 'assets', 'custom-schema.json');
  const uiSchemaPath = join(__dirname, 'assets', 'custom-uischema.json');

  const newEditorInstance = {
    ...editorInstance,
    window: {
      ...editorInstance.window,
      showInputBox: async (param: any) => {
        if (param.id === 'projectName') {
          enterProjectNameWasCalled = true;
          return projectName;
        } else if (param.id === 'schemaPath') {
          enterSchemaPathWasCalled = true;
          return schemaPath;
        }
        return false;
      },
      showOpenDialog: async (param: any) => {
        if (param.id === 'path') {
          selectPathWasCalled = true;
        return [{fsPath: path}];
        }
        return false;
      },
    },
  };

  beforeAll(async () => {
    jest.setTimeout(500000);
    await mkdirWithPromise(path);
    return createProject(newEditorInstance, '');
  });

  afterAll(async () => {
    return rimrafWithPromise(path);
  });

  test('If path for project was asked', async () => {
    expect(selectPathWasCalled).toBe(true);
  });

  test('If project name was asked', async () => {
    expect(enterProjectNameWasCalled).toBe(true);
  });

  test('If schema path was asked', async () => {
    expect(enterSchemaPathWasCalled).toBe(true);
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

  test('Check if scaffolding uses custom schema', async () => {
    let customContent = null;
    let customRealContent = null;
    try {
      customContent = await readFileWithPromise(join(srcPath, 'schema.json'), 'utf8');
      customRealContent = await readFileWithPromise(schemaPath, 'utf8');
    } catch (err) {
      return;
    }
    expect(customContent).toBe(customRealContent);
  });

  test('Check if generated custom uischema matches expected ui schema', async () => {
    let customContent = null;
    let customRealContent = null;
    try {
      customContent = await readFileWithPromise(join(srcPath, 'uischema.json'), 'utf8');
      customRealContent = await readFileWithPromise(uiSchemaPath, 'utf8');
    } catch (err) {
      return;
    }
    expect(customContent).toBe(customRealContent);
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
