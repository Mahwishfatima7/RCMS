const { getOne, getAll, insertOne, updateOne } = require("../config/database");

class SerialEntry {
  static async findBySerialNo(serialNo) {
    return getOne("SELECT * FROM camera_serials WHERE serial_number = ?", [
      serialNo,
    ]);
  }

  static async getAll(limit = 50, offset = 0) {
    const safeLimit = Number(limit) || 50;
    const safeOffset = Number(offset) || 0;
    return getAll(
      `SELECT * FROM camera_serials ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [],
    );
  }

  static async create(data) {
    const result = await insertOne(
      `INSERT INTO camera_serials (
        serial_number, item_no, item_description
      ) VALUES (?, ?, ?)`,
      [
        data.serialNumber,
        data.itemNo,
        data.itemDescription,
      ],
    );
    return this.findBySerialNo(data.serialNumber);
  }

  static async update(serialNo, data) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = [...Object.values(data), serialNo];
    await updateOne(
      `UPDATE camera_serials SET ${fields} WHERE serial_number = ?`,
      values,
    );
    return this.findBySerialNo(serialNo);
  }

  static async delete(serialNo) {
    return updateOne("DELETE FROM camera_serials WHERE serial_number = ?", [
      serialNo,
    ]);
  }

  static async checkExists(serialNo) {
    const serial = await this.findBySerialNo(serialNo);
    return serial ? { exists: true, entry: serial } : { exists: false, entry: null };
  }
}

module.exports = SerialEntry;
