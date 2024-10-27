import Router from 'router';

import { apiPublicWrapper } from '../utils/apiWrapper.js';
import authValidator from '../validations/auth.js';
import authAction from '../actions/auth.js';

//initialize router
const authApi = Router();

authApi.route('/api/v1/auth/registration').post(apiPublicWrapper(async (req) => {
  console.log('======>', req.body);
  await authValidator.registration(req.body);
  const userData = await authAction.registration(req.body);
  return authAction.login(userData);
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