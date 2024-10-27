import bcrypt from 'bcrypt';

import validator from '../utils/validator.js';
import { loginRules, registerRules } from './rules/auth.js';
import authAction from '../actions/auth.js';

class AuthValidator {
  async registration(body = {}) {
    validator.check(body, registerRules);

    const existsEmail = await authAction.getUserByEmail(body.email);

    if (existsEmail) {
      throw { email: 'User with this email already exists.' };
    }
  }

  async login(body = {}, admin = false) {
    validator.check(body, loginRules);

    const userData = await authAction.getUserByEmail(body.email);

    if (!userData) {
      throw { email: 'User not found' };
    }

    let compareOk;

    if (userData.password) {
      compareOk = await bcrypt.compare(body.password, userData.password);
    }

    if (!compareOk) {
      throw { password: 'Incorrect password' };
    }

    if (admin && !userData.is_admin) {
      throw { email: 'Access is denied' };
    }

    return userData;
  }
}

export default new AuthValidator();