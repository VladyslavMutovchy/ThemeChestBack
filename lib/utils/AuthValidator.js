import bcrypt from 'bcrypt';
import validator from 'validator';
import authAction from '../actions/authAction.js';

class AuthValidator {
  constructor() {
    this.loginRules = {
      email: {
        notEmpty: { message: 'Email is required' },
        isEmail: { message: 'Wrong email format' }
      },
      password: {
        notEmpty: { message: 'Password is required' },
        minLength: 6
      }
    };

    this.registerRules = {
      ...this.loginRules
    };
  }

  validate(data, rules) {
    const errors = {};
    for (const [field, conditions] of Object.entries(rules)) {
      if (conditions.notEmpty && !data[field]) {
        errors[field] = conditions.notEmpty.message;
      }
      if (conditions.isEmail && !validator.isEmail(data[field] || '')) {
        errors[field] = conditions.isEmail.message;
      }
      if (field === 'password' && (data[field] || '').length < conditions.minLength) {
        errors[field] = `Password must be at least ${conditions.minLength} characters long`;
      }
    }
    if (Object.keys(errors).length) throw { error: Object.values(errors).join(', ') };;
  }

  async registration(body) {
    this.validate(body, this.registerRules);
    const userExists = await authAction.getUserByEmail(body.email);
    if (userExists) throw { error: 'User with this email already exists.' };
  }

  async login(body) {
    this.validate(body, this.loginRules);
    const userData = await authAction.getUserByEmail(body.email);
    if (!userData) throw { error: 'User not found' };
    const isPasswordMatch = await bcrypt.compare(body.password, userData.password);
    if (!isPasswordMatch) throw { error: 'Incorrect password' };
    return userData;
  }
}

export default new AuthValidator();
