const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("../config/config");

const runMigrations = async () => {
  let connection;
  try {
        // Create a connection with multipleStatements enabled
    connection = await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      multipleStatements: true,
    });

    // Read and execute migration
    const migrationPath = path.join(__dirname, "../../sql/migrate_add_account_number.sql");
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, "utf8");
      // Split by semicolon and execute each statement
      const statements = migration.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        try {
          await connection.query(statement);
           + "...");
        } catch (err) {
          // Skip errors for existing columns/indexes
          if (err.message.includes("Duplicate column") || err.message.includes("Duplicate key")) {
             + "... (already exists)");
          } else {
            throw err;
          }
        }
      }
       completed");
    }

    await connection.end();
        process.exit(0);
  } catch (err) {
        if (connection) await connection.end();
    process.exit(1);
  }
};

runMigrations();



