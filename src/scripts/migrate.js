const { query, close } = require("../config/database");
const { schemaStatements } = require("./postgresSchema");

const runMigrations = async () => {
  try {
    for (const statement of schemaStatements) {
      if (!statement.trim()) {
        continue;
      }

      await query(statement);
    }

    console.log("Database schema created successfully.");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await close();
  }
};

runMigrations();
