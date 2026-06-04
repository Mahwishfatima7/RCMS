const { Pool, types } = require("pg");
const config = require("./config");

const connectionString = config.databaseUrl || "";

types.setTypeParser(20, (value) => Number.parseInt(value, 10));
types.setTypeParser(1700, (value) => Number.parseFloat(value));

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Set it to your Neon PostgreSQL connection string.",
  );
}

const pool = new Pool({
  connectionString,
  ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
});

const formatQuery = (sql, values = []) => {
  let index = 0;
  const text = sql.replace(/\?/g, () => `$${++index}`);
  return { text, values };
};

const query = async (sql, values = []) => {
  const { text, values: params } = formatQuery(sql, values);
  return pool.query(text, params);
};

const getOne = async (sql, values = []) => {
  const result = await query(sql, values);
  return result.rows[0];
};

const getAll = async (sql, values = []) => {
  const result = await query(sql, values);
  return result.rows;
};

const insertOne = async (sql, values = []) => {
  const { text, values: params } = formatQuery(sql, values);
  const hasReturning = /\breturning\b/i.test(text);
  const insertText = hasReturning ? text : `${text.replace(/;$/, "")} RETURNING id`;
  const result = await pool.query(insertText, params);
  return {
    insertId: result.rows[0]?.id ?? null,
    affectedRows: result.rowCount,
  };
};

const updateOne = async (sql, values = []) => {
  const result = await query(sql, values);
  return {
    affectedRows: result.rowCount,
    changedRows: result.rowCount,
  };
};

const close = async () => {
  await pool.end();
};

pool
  .query("SELECT 1")
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  insertOne,
  updateOne,
  close,
};
