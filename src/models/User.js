const { getOne, getAll, insertOne, updateOne } = require("../config/database");

class User {
  static async findById(id) {
    return getOne(
      "SELECT id, name, email, role, status, phone, contact_no, emergency_contact, manager_name, department, created_at FROM users WHERE id = ?",
      [id],
    );
  }

  static async findByEmail(email) {
    return getOne("SELECT * FROM users WHERE email = ?", [email]);
  }

  static async getAll(limit = 50, offset = 0) {
    const safeLimit = Number(limit) || 50;
    const safeOffset = Number(offset) || 0;
    return getAll(
      `SELECT id, name, email, role, status, phone, contact_no, emergency_contact, manager_name, department, created_at FROM users LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [],
    );
  }

  static async create(data) {
    const result = await insertOne(
      "INSERT INTO users (name, email, password_hash, role, status, phone, contact_no, emergency_contact, manager_name, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        data.name,
        data.email,
        data.passwordHash,
        data.role,
        "active",
        data.phone || null,
        data.contact_no || null,
        data.emergency_contact || null,
        data.manager_name || null,
        data.department || null,
      ],
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = [...Object.values(data), id];
    await updateOne(`UPDATE users SET ${fields} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id) {
    return updateOne("DELETE FROM users WHERE id = ?", [id]);
  }
}

module.exports = User;
