// manage database connection
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: 'user',
  password: 'pass123',
  database: 'tb_todo'
};

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

module.exports = { getConnection };