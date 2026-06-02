const mysql = require("mysql2/promise");
const config = require("./config");

// Create connection pool
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: config.database.waitForConnections,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit,
  multipleStatements: true,
});

// Test connection
pool
  .getConnection()
  .then((conn) => {
        conn.release();
  })
  .catch((err) => {
        process.exit(1);
  });

// Execute query helper
const query = (sql, values) => {
  return pool.execute(sql, values);
};

// Get single row
const getOne = (sql, values) => {
  return pool.execute(sql, values).then(([rows]) => rows[0]);
};

// Get all rows
const getAll = (sql, values) => {
  return pool.execute(sql, values).then(([rows]) => rows);
};

// Insert and return insert id
const insertOne = (sql, values) => {
  return pool.execute(sql, values).then(([result]) => ({
    insertId: result.insertId,
    affectedRows: result.affectedRows,
  }));
};

// Update/Delete
const updateOne = (sql, values) => {
  return pool.execute(sql, values).then(([result]) => ({
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
  }));
};

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  insertOne,
  updateOne,
};

