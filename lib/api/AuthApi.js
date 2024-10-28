import Router from 'router';
import { apiPublicWrapper } from '../utils/apiHandler.js';
import authValidator from '../utils/AuthValidator.js';
import authAction from '../actions/authAction.js';

const authApi = Router();

authApi.route('/api/v1/auth/registration').post(apiPublicWrapper(async (req) => {
  await authValidator.registration(req.body);
  return authAction.registration(req.body);
}));

authApi.route('/api/v1/auth/login').post(apiPublicWrapper(async (req) => {
  const userData = await authValidator.login(req.body);
  return authAction.login(userData);
}));

authApi.route('/api/v1/admin/auth/login').post(apiPublicWrapper(async (req) => {
  const userData = await authValidator.login(req.body, true);
  return authAction.adminLogin(userData);
}));

authApi.route('/api/v1/auth/google').post(apiPublicWrapper((req) => {
  return authAction.googleAuth(req.body.code);
}));

authApi.route('/api/v1/auth/facebook').post(apiPublicWrapper(async (req) => {
  return await authAction.facebookAuth(req.body.code);
}));

export default authApi;