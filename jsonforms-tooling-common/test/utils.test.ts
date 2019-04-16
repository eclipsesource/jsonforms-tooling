import { MessageType, showMessage, validateUiSchema } from '../src/utils';
import { editorInstance } from './assets/editorInstance';

/**
 * Test cases for the Tooling package.
 */

describe('Test validateUiSchema', () => {
  const validUiSchema = {
    'type': 'VerticalLayout',
    'elements': [
      {
        'type': 'Control',
        'label': 'Name',
        'scope': '#/properties/name'
      },
      {
        'type': 'Control',
        'label': 'Description',
        'scope': '#/properties/description'
      },
      {
        'type': 'Control',
        'label': 'Done',
        'scope': '#/properties/done'
      },
      {
        'type': 'Control',
        'label': 'Due Date',
        'scope': '#/properties/due_date'
      },
      {
        'type': 'Control',
        'label': 'Rating',
        'scope': '#/properties/rating'
      },
      {
        'type': 'Control',
        'label': 'Recurrence',
        'scope': '#/properties/recurrence'
      },
      {
        'type': 'Control',
        'label': 'Recurrence Interval',
        'scope': '#/properties/recurrence_interval'
      }
    ]
  };

  const notValidUiSchema = {
    'type': 'object',
    'properties': {
      'name': {
        'type': 'string'
      },
      'description': {
        'type': 'string'
      },
      'done': {
        'type': 'boolean'
      },
      'due_date': {
        'type': 'string',
        'format': 'date'
      },
      'rating': {
        'type': 'integer',
        'maximum': 5
      },
      'recurrence': {
        'type': 'string',
        'enum': [
          'Never',
          'Daily',
          'Weekly',
          'Monthly'
        ]
      },
      'recurrence_interval': {
        'type': 'integer'
      }
    },
    'required': [
      'name'
    ]
  };

  // Test case for validateUiSchema function
  test('valid ui schema', async () => {
    const resultTrue = await validateUiSchema(validUiSchema);
    expect(resultTrue).toBe(true);
  });

  test('not valid uischema', async () => {
    const resultFalse = await validateUiSchema(notValidUiSchema);
    expect(resultFalse).toBe(false);
  });
});

describe('Test showMessage', () => {
  test('showMessage: Error', async () => {
    const message = 'errTest';
    const result = await showMessage(editorInstance, message, MessageType.Error);
    expect(result).toBe(message);
  });

  test('showMessage: Warning', async () => {
    const message = 'warTest';
    const result = await showMessage(editorInstance, message, MessageType.Warning);
    expect(result).toBe(message);
  });

  test('showMessage: Information', async () => {
    const message = 'infoTest';
    const result = await showMessage(editorInstance, message);
    expect(result).toBe(message);
  });
});
