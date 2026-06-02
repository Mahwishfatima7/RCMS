const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const seedDatabase = async () => {
  try {
        const seedPath = path.join(__dirname, "../../sql/seed.sql");
    const seedData = fs.readFileSync(seedPath, "utf8");

    const connection = await pool.getConnection();
    await connection.query(seedData);
    connection.release();

        process.exit(0);
  } catch (err) {
        process.exit(1);
  }
};

seedDatabase();

