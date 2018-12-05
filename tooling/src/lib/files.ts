import { statSync } from 'fs';
import { basename, sep } from 'path';

export const getCurrentDirectoryBase = () => {
  return basename(process.cwd());
};

export const directoryExists = (filePath: string) => {
  try {
    return statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
};

export const getSep = () => {
  return sep;
};

export const getCurrentPath = () => {
  return process.cwd();
};
