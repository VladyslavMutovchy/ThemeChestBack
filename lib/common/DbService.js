import mysql from 'mysql2/promise';
import _ from 'lodash';

/*
    Main Db service class. To get connection and run select insert operations
*/
export default class DbService {
  constructor() {
    this.options = {
      "host": process.env.DB_HOST,
      "port": process.env.DB_PORT,
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "database": process.env.DB_DATABASE,
    };

    this.pool = null;
    this.connect();
  }

  async connect() {
    this.pool = mysql.createPool({
      host: this.options.host,
      user: this.options.username,
      password: this.options.password,
      database: this.options.database,
      charset: "utf8mb4"
    });
    //check connection. If OK
    try {
      const [rows] = await this.pool.query('SELECT 1 + 1 AS solution');
      console.log('Db connected');
    } catch (error) {
      console.log("Error connecting to MySQL. Err :" + error.message);
    }
  }

  async getConnection() {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      throw error;
    }
  }

  async runQuery(query, data) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.query(query, data);
      return results;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  get(table, filter) {
    const filterFields = [];
    const queryData = [];

    _.forEach(filter, (value, field) => {
      filterFields.push(`${field} = ?`);
      queryData.push(value);
    });

    const query = `SELECT * FROM ${table} WHERE ${filterFields.join(' AND ')}`;

    return this.runQuery(query, queryData);
  }

  async getOne(table, filter) {
    const result = await this.get(table, filter);
    return result[0];
  }

  async getAll(table) {
    const query = `SELECT * FROM ${table}`;
    return this.runQuery(query);
  }

  async getById(table, id) {
    const queryQuery = `SELECT * FROM ${table} WHERE id = ?`;
    const data = await this.runQuery(queryQuery, [id]);
    return data[0];
  }

  update(table, data, filter) {
    const updateFields = [];
    const queryData = [];

    _.forEach(data, (value, field) => {
      updateFields.push(`${field} = ?`);
      queryData.push(value);
    });

    const filterFields = [];

    _.forEach(filter, (value, field) => {
      filterFields.push(`${field} = ?`);
      queryData.push(value);
    });

    const query = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${filterFields.join(' AND ')}`;

    return this.runQuery(query, queryData);
  }

  updateById(table, data, id) {
    return this.update(table, data, { id });
  }

  async insert(table, data) {
    const insertFields = [];
    const insertData = [];

    _.forEach(data, (value, field) => {
      insertFields.push(`${field} = ?`);
      insertData.push(value);
    });

    const query = `INSERT INTO ${table} SET ${insertFields.join(', ')}`;

    const newData = await this.runQuery(query, insertData);

    return newData.insertId;
  }

  deleteById(table, id) {
    const queryQuery = `DELETE FROM ${table} WHERE id = ?`;
    return this.runQuery(queryQuery, [id]);
  }
}
