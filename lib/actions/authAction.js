import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import DbService from '../common/DbService.js'

const db = new DbService();

class AuthAction {
  async registration(authData) {
    const passwordHash = await bcrypt.hash(authData.password, 10);
    const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
    const result = await db.runQuery(query, [authData.email, passwordHash]);
    return this.login({ id: result.insertId, email: authData.email });
  }
 
  async login(user) {
    const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '2d' });
    return { id: user.id, email: user.email, token };
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [user] = await db.runQuery(query, [email]);
    return user;
  }
}

export default new AuthAction();
