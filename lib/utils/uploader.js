import multer from 'multer';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';

export const removeFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      err ? console.log(err.message) : console.log("Successfully removed file. File: " + filePath);
    });
  } else {
    console.log("Weird file path is missing.");
  }
};

const removeFiles = (files) => {
  files.forEach((file) => removeFile(file.path));
};

const getUniqueFileName = (folder, fileData) => {
  let filePath = `${folder}${fileData.filename}`;

  if (!fs.existsSync(filePath)) {
    return {
      name: fileData.filename,
      path: filePath,
    };
  }

  const extension = fileData.filename.split('.').pop();
  const fileName = fileData.filename.replace(`.${extension}`, '');
  let index = 0;
  let newFileName;

  do {
    index++;
    newFileName = `${fileName}_${index}.${extension}`;
    filePath = `${folder}/${newFileName}`;
  } while (fs.existsSync(filePath));

  return {
    name: newFileName,
    path: filePath,
  };
};

const moveFile = (fileData, folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  const newFileData = getUniqueFileName(folder, fileData);
  fs.renameSync(fileData.path, newFileData.path);
  return `${folder}${newFileData.name}`;
};

const moveFiles = (files, folder) => {
  return files.map(file => moveFile(file, folder));
};

const initUploader = (options) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fileOptions = options[file.fieldname];

      if (!fileOptions) {
        return cb(new Error('Invalid file field'));
      }

      const { folder, extensions } = fileOptions;

      const regexp = new RegExp(`\.(${extensions.join('|')})$`, 'i');

      if (!file.originalname.match(regexp)) {
        return cb(new Error('Invalid mime type'));
      }
      cb(null, path.join(process.cwd(), folder))
    },
    filename: function (req, file, cb) {
      //set up file name
      cb(null, file.originalname);
    }
  });

  return multer({ storage }).any('files');
};

const getSizeInBytes = maxSize => maxSize * 1024 * 1024;

const throwUploadFile = (files, error) => {
  removeFiles(files);
  throw(error);
};

const fileProcessing = (req, options) => {
  const fileFields = {};

  const { files } = req;

  // File size validation & grouping files
  files.forEach((fileData) => {
    const field = fileData.fieldname;

    const fileOptions = options[field];

    const { maxSize, multiple } = fileOptions;
    const maxFileSizeInBytes = getSizeInBytes(maxSize);

    if (fileData.size > maxFileSizeInBytes) {
      throwUploadFile(files, `Max file size is ${maxSize}M`);
    }

    if (multiple) {
      if (!fileFields[field]) {
        fileFields[field] = [];
      }
      fileFields[field].push(fileData);
    } else {
      if (fileFields[field]) {
        throwUploadFile(files, `You cannot upload multiple files for field ${field}`);
      }
      fileFields[field] = fileData;
    }
  });

  // Required & max number of files validation
  _.forEach(options, (fieldOptions, field) => {
    const { isRequired, maxNumber } = fieldOptions;

    const fieldFiles = fileFields[field];

    if (isRequired && !fieldFiles) {
      throwUploadFile(files, `${field} is required`);
    }

    if (maxNumber && fieldFiles?.length > maxNumber) {
      throwUploadFile(files, `Max number of files for ${field} is ${maxNumber}`);
    }
  });

  // Move files to user folder (!don't move in previous loop)
  _.forEach(fileFields, (file, field) => {
    const { multiple, folder } = options[field];

    const userFolder = `${folder}${req.userId}/`;
    const fieldFiles = fileFields[field];

    if (multiple) {
      req[field] = moveFiles(fieldFiles, userFolder);
    } else {
      req[field] = moveFile(fieldFiles, userFolder);
    }
  });
};

export const getFileUploader = (options) => {
  const upload = initUploader(options);

  return (action) => (req, res) => {
    upload(req, res, async (error) => {
      try {
        if (error) {
          throw(error.message);
        }

        fileProcessing(req, options);

        const response = await action(req, res);
        global.responses.response(res, response);

      } catch (error) {
        return global.responses.errorResponse(res, error);
      }
    });
  }
};
