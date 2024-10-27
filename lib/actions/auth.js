import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';

class AuthAction {
  async registration(authData) {
    let password = null;
    if (authData.password) {
      password = await bcrypt.hash(authData.password, 5);
    }
  
    const addUserQuery = 'INSERT INTO users SET email = ?, password = ?';
    const insertData = [
      authData.email,
      password,
    ];
    const newUserData = await global.dbConnection.runQuery(addUserQuery, insertData);
  
    const userData = {
      ...authData,
      id: newUserData.insertId,
    };
    return this.login(userData);
  }

  async login(userData) {
    const loginUserData = _.pick(userData, ['id', 'first_name', 'about', 'last_name', 'email', 'picture', 'plan', 'plan_expired']);

    loginUserData.token = jwt.sign({
      id: userData.id,
    }, process.env.SECRET, { expiresIn: '7d' });

    return loginUserData;
  }

  async authProceed(authData) {
    let whereCondition;
    const whereData = [];

    if (authData.fb_id) {
      whereCondition = 'fb_id = ?';
      whereData.push(authData.fb_id);
    } else if (authData.email) {
      whereCondition = 'email = ?';
      whereData.push(authData.email);
    } else {
      throw({ message: 'Authentication error' });
    }

    const getUserQuery = `SELECT id, first_name, last_name, email, picture FROM users WHERE ${whereCondition}`;

    const userData = await global.dbConnection.runQuery(getUserQuery, whereData);

    if (userData.length) {
      return this.login(userData[0]);
    }

    return this.registration(authData);
  }

  async getUserByEmail(email) {
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const userData = await global.dbConnection.runQuery(checkQuery, [email]);
    return userData[0];
  }
}

export default new AuthAction();
