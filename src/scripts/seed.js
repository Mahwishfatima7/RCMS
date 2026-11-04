const fs = require("fs");
const path = require("path");
const { query, close } = require("../config/database");
const { extractTableInserts } = require("./mysqlDumpParser");

const TABLE_ORDER = [
  "users",
  "camera_serials",
  "complaints",
  "manufacturer_updates",
  "audit_logs",
  "sla_config",
  "sla_audit",
];

const TABLE_COLUMNS = {
  users: [
    "id",
    "name",
    "email",
    "password_hash",
    "role",
    "status",
    "phone",
    "contact_no",
    "emergency_contact",
    "manager_name",
    "department",
    "created_at",
    "updated_at",
  ],
  camera_serials: [
    "id",
    "serial_number",
    "item_no",
    "item_description",
    "created_at",
    "updated_at",
  ],
  complaints: [
    "id",
    "ticket_no",
    "agent_id",
    "customer_name",
    "customer_phone",
    "customer_email",
    "customer_address",
    "customer_account_no",
    "serial_no",
    "device_model",
    "issue_description",
    "status",
    "priority",
    "sla_duration",
    "sla_deadline",
    "sla_status",
    "sla_breached_at",
    "created_at",
    "updated_at",
  ],
  manufacturer_updates: [
    "id",
    "complaint_id",
    "booking_id",
    "booked_date",
    "manufacturer_status",
    "reference_no",
    "notes",
    "customer_account_no",
    "updated_at",
  ],
  audit_logs: [
    "id",
    "user_id",
    "action",
    "entity_type",
    "entity_id",
    "old_values",
    "new_values",
    "ip_address",
    "user_agent",
    "timestamp",
  ],
  sla_config: [
    "id",
    "priority",
    "duration_hours",
    "at_risk_percentage",
    "created_at",
    "updated_at",
  ],
  sla_audit: [
    "id",
    "complaint_id",
    "old_status",
    "new_status",
    "triggered_at",
    "reason",
  ],
};

const DEFAULT_DUMP_PATH =
  process.env.MYSQL_DUMP_PATH || "C:\\Users\\DELL\\Downloads\\Dump20260603.sql";

const resolveDumpPath = () => {
  const argPath = process.argv[2];
  const candidate = argPath || DEFAULT_DUMP_PATH;
  return path.resolve(candidate);
};

const buildInsert = (table, row) => {
  const columns = TABLE_COLUMNS[table];
  const quotedColumns = columns
    .map((column) => (column === "timestamp" ? '"timestamp"' : column))
    .join(", ");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  return {
    text: `INSERT INTO ${table} (${quotedColumns}) VALUES (${placeholders})`,
    values: row,
  };
};

const resetIdentity = async (table) => {
  await query(
    `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`,
  );
};

const seedDatabase = async () => {
  const dumpPath = resolveDumpPath();

  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Dump file not found: ${dumpPath}`);
  }

  const dumpText = fs.readFileSync(dumpPath, "utf8");

  await query("BEGIN");

  try {
    await query(
      "TRUNCATE TABLE sla_audit, manufacturer_updates, complaints, audit_logs, camera_serials, users, sla_config RESTART IDENTITY CASCADE",
    );

    for (const table of TABLE_ORDER) {
      const rows = extractTableInserts(dumpText, table);

      for (const row of rows) {
        const { text, values } = buildInsert(table, row);
        await query(text, values);
      }

      await resetIdentity(table);
    }

    await query("COMMIT");
    console.log(`Seeded PostgreSQL database from ${dumpPath}`);
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  } finally {
    await close();
  }
};

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
});
