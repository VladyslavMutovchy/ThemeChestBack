const response = (res, data, code = 200) => {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
};

const errorResponse = (res, error, code = 400) => {
  response(res, { error: error.message || error }, code);
};

const catchErrorResponse = (res, error) => {
  const errorData = global.helpers.processError(error);
  errorResponse(res, errorData.message, errorData.code);
};

const unauthorizedAccess = (res) => {
  errorResponse(res, 'Unauthorized access');
};

export default {
  response,
  errorResponse,
  catchErrorResponse,
  unauthorizedAccess,
};
