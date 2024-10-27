class HelperService {
  constructor() {}

  processError(error) {
    let message = null;
    let code = null;

    //if we have SQL error message. We use different code for this
    if (error.sqlMessage) {
      const sqlCodeMapper = { ER_DUP_ENTRY: "Duplicate key error." };

      error.code = sqlCodeMapper.hasOwnProperty(error.code) ? sqlCodeMapper[error.code] : error.code;
      message = error.errno == 999 ? error.sqlMessage : error.code;
      code = 400;
    } else {
      if (error.message) {
        message = error.message;
        code = error.code == 409 || error.code == 304 || error.code == 400 ? error.code : 500;
      } else if (Object.keys(error).length) {
        message = error;
        code = 400;
      } else {
        message = 'Internal server error';
        code = 500
      }
    }

    return { message, code }
  }
}

export default new HelperService();