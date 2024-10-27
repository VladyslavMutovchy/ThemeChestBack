import { fileURLToPath } from 'url';
import path from 'path';


const trimString = (string) => {
  string = string.replace(/\n/g, '');
  return string.replace(/ +/g, ' ').trim();
};

const getDirName = (url) => {
  const __filename = fileURLToPath(url);
  return path.dirname(__filename);
};

export {
  trimString,
  getDirName,
};