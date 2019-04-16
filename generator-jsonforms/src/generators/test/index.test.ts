// tslint:disable:no-var-requires
// tslint:disable:no-require-imports

/*import { join } from 'path';
import { Project } from '../app/index';

const helpers = require('yeoman-test');
const assert = require('yeoman-assert');*/

describe('Generators package tests', () => {
  // jest.setTimeout(500000);

  test('test to have one test', () => {
    expect(true).toBe(true);
  });

  /*test('Generator with passed options', () => {
    const path = './';
    const options = {
      project: Project.Seed,
      path,
      name: 'test-project',
      schemaPath: '',
      skipPrompting: true,
    };
    return helpers.run(join(__dirname, '../app'))
    .withOptions( options )
    .withPrompts( {} )
    .then((dir: any) => {
      assert.file(join(dir, 'package.json'));
    });
  });

  test('Generator without passed options and prompting', async () => {
    const path = './';
    const prompt = {
      project: ProjectRepo.Seed,
      path,
      name: 'test-project-2',
      schemaPath: '',
      skipPrompting: false,
    };
    return await helpers.run(join(__dirname, '../app'))
    .withOptions( {} )
    .withPrompts( prompt )
    .withLocalConfig({ lang: 'en' })
    .then((dir: any) => {
      assert.file(join(dir, 'package.json'));
    });
  });
  */
});
