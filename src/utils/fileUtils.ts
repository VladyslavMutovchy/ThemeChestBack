import * as fs from 'fs';
import * as path from 'path';

export const convertFileToBase64 = (filePath: string): { base64: string; mimeType: string } | null => {
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = getMimeTypeFromExtension(path.extname(filePath));
    return { base64: base64Image, mimeType };
  }
  return null;
};

export const getMimeTypeFromExtension = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
};

