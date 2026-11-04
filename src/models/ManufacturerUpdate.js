const { getOne, getAll, insertOne, updateOne } = require("../config/database");

class ManufacturerUpdate {
  static async findById(id) {
    return getOne("SELECT * FROM manufacturer_updates WHERE id = ?", [id]);
  }

  static async findByComplaintId(complaintId) {
    return getOne("SELECT * FROM manufacturer_updates WHERE complaint_id = ?", [
      complaintId,
    ]);
  }

  static async findByBookingId(bookingId) {
    return getOne("SELECT * FROM manufacturer_updates WHERE booking_id = ?", [
      bookingId,
    ]);
  }

  static async getAll(limit = 50, offset = 0) {
    const safeLimit = Number(limit) || 50;
    const safeOffset = Number(offset) || 0;
    return getAll(
      `SELECT * FROM manufacturer_updates ORDER BY updated_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [],
    );
  }

  static async create(data) {
    const result = await insertOne(
      `INSERT INTO manufacturer_updates (
        complaint_id, booking_id, booked_date, manufacturer_status, reference_no, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.complaintId,
        data.bookingId,
        data.bookedDate,
        data.manufacturerStatus,
        data.referenceNo,
        data.notes,
      ],
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = [...Object.values(data), id];
    await updateOne(
      `UPDATE manufacturer_updates SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values,
    );
    return this.findById(id);
  }

  static async delete(id) {
    return updateOne("DELETE FROM manufacturer_updates WHERE id = ?", [id]);
  }
}

module.exports = ManufacturerUpdate;
