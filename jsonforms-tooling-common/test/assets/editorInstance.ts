export const editorInstance = {
  window: {
    createWebviewPanel: jest.fn(() => true),
    showInputBox: jest.fn(() => true),
    showErrorMessage: (message: any) => {
      // console.log('Error Message: ' + message);
      return message;
    },
    showWarningMessage: (message: any) => {
      // console.log('Warning Message: ' + message);
      return message;
    },
    showInformationMessage: (message: any) => {
      // console.log('Information Message: ' + message);
      return message;
    },
    showQuickPick: jest.fn(() => true),
    showOpenDialog: jest.fn(() => true),
  },
  QuickPickOptions: {},
  InputBoxOptions: {},
  Uri: {
    file: jest.fn(() => true)
  },
};
