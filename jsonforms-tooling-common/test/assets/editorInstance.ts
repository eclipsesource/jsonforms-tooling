export const editorInstance = {
  window: {
    createWebviewPanel: jest.fn(() => true),
    showInputBox: jest.fn(() => true),
    showErrorMessage: (message: any) => {
      return message;
    },
    showWarningMessage: (message: any) => {
      return message;
    },
    showInformationMessage: (message: any) => {
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
