import mysql from 'mysql';
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

  connect() {
    this.pool = mysql.createPool({
      host: this.options.host,
      user: this.options.username,
      password: this.options.password,
      database: this.options.database,
      charset: "utf8mb4"
    });
    //check connection. If OK
    this.pool.query('SELECT 1 + 1 AS solution', function (error) {
      error ? console.log("Error connecting to MySQL. Err :" + error.message) :
        console.log('Db connected');
    });
  }

  getConnection() {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((error, connection) => {
        return error ? reject(error) : resolve(connection);
      })
    });
  }

  runQuery(query, data) {
    return new Promise((resolve, reject) => {
      this.getConnection()
        .then(connection => {
          connection.query(query, data, (error, results) => {
            // We done with connection return to pool
            connection.release();
            return error ? reject(error) : resolve(results);
          });
        })
        .catch(err => reject(err));
    });
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

  /**
   * Insert many records to table
   * @param table name of table
   * @param dataArray array of fields data. Each element must have the same properties
   * @returns {Promise<void>}
   */
  insertMany(table, dataArray) {
    const fields = [];
    const questions = [];
    const questionsRows = [];
    const insertData = [];

    dataArray.forEach((rowData, index) => {
      // Map need for sort properties
      let mapRowData = new Map(Object.entries(rowData));
      mapRowData = new Map([...mapRowData.entries()].sort());

      mapRowData.forEach((value, field) => {
        if (!index) {
          fields.push(field);
          questions.push('?');
        }

        insertData.push(value);
      });
      questionsRows.push(`(${questions.join(', ')})`);
    });

    const fieldsList = fields.join(', ');
    const questionsList = questionsRows.join(', ');

    const query = `INSERT INTO ${table} (${fieldsList}) VALUES ${questionsList}`;

    this.runQuery(query, insertData);
  }

  delete(table, filter) {
    const filterFields = [];
    const queryData = [];

    _.forEach(filter, (value, field) => {
      filterFields.push(`${field} = ?`);
      queryData.push(value);
    });

    const query = `DELETE FROM ${table} WHERE ${filterFields.join(' AND ')}`;

    return this.runQuery(query, queryData);
  }

  deleteById(table, id) {
    const queryQuery = `DELETE FROM ${table} WHERE id = ?`;
    return this.runQuery(queryQuery, [id]);
  }
}