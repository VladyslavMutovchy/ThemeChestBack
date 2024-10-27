import jwt from 'jsonwebtoken';
import url from 'url';

const apiHandler = async (action, req, res) => {
  try {
    if (req.method === 'GET') {
      const queryData = url.parse(req.url, true);
      req.query = queryData.query;
    }

    const response = await action(req, res);
    if (typeof response !== 'undefined') {
      global.responses.response(res, response);
    }
  } catch (error) {
    console.log('===ERROR', error);
    global.responses.catchErrorResponse(res, error);
  }
};

const apiAuthWrapper = async (req, res, action, secret) => {
  try {
    let token = req.headers['x-solt'];

    if (!token) {
      return global.responses.unauthorizedAccess(res);
    }

    const tokenData = await jwt.verify(token, secret);

    req.userId = tokenData.id;

  } catch (error) {
    return global.responses.catchErrorResponse(res, error);
  }
  await apiHandler(action, req, res);
};

export const apiPrivateWrapper = (action) => (req, res) => {
  return apiAuthWrapper(req, res, action, process.env.SECRET);
};

export const apiAdminWrapper = (action) => (req, res) => {
  return apiAuthWrapper(req, res, action, process.env.ADMIN_SECRET);
};

export const apiPublicWrapper = (action) => (req, res) => {
  return apiHandler(action, req, res);
};
