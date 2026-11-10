
const { getOne, getAll, insertOne, updateOne } = require("../config/database");
const slaService = require("../utils/slaService");

class Complaint {
  static async findById(id) {
    return getOne(
      `SELECT c.*, u.name AS agent_name, u.email AS agent_email, cs.item_no, cs.item_description
       FROM complaints c
       LEFT JOIN users u ON c.agent_id = u.id
       LEFT JOIN camera_serials cs ON c.serial_no = cs.serial_number
       WHERE c.id = ?`,
      [id],
    );
  }

  static async findByTicketNo(ticketNo) {
    return getOne("SELECT * FROM complaints WHERE ticket_no = ?", [ticketNo]);
  }

  static async getAll(filters = {}) {
    let sql = `SELECT c.*, u.name AS agent_name, u.email AS agent_email, cs.item_no, cs.item_description
               FROM complaints c
               LEFT JOIN users u ON c.agent_id = u.id
               LEFT JOIN camera_serials cs ON c.serial_no = cs.serial_number
               WHERE 1=1`;
    const values = [];

    if (filters.status) {
      sql += " AND c.status = ?";
      values.push(filters.status);
    }
    if (filters.agentId) {
      sql += " AND c.agent_id = ?";
      values.push(filters.agentId);
    }
    if (filters.agentIds && Array.isArray(filters.agentIds) && filters.agentIds.length > 0) {
      const placeholders = filters.agentIds.map(() => "?").join(",");
      sql += ` AND c.agent_id IN (${placeholders})`;
      values.push(...filters.agentIds);
    }
    if (filters.slaStatus) {
      sql += " AND c.sla_status = ?";
      values.push(filters.slaStatus);
    }
    if (filters.priority) {
      sql += " AND c.priority = ?";
      values.push(filters.priority);
    }
    if (filters.search) {
      sql += " AND (c.ticket_no LIKE ? OR c.customer_name LIKE ? OR c.serial_no LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const limit = Number(filters.limit) || 50;
    const offset = Number(filters.offset) || 0;
    sql += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    return getAll(sql, values);
  }

  static async create(data) {
    const priority = data.priority || "medium";
    const slaDuration = await slaService.getSLADuration(priority);
    const now = new Date();
    const slaDeadline = slaService.getSLADeadline(now, priority);

    const result = await insertOne(
      `INSERT INTO complaints (
        ticket_no, agent_id, customer_name, customer_phone, customer_email,
        customer_address, customer_account_no, serial_no, device_model, issue_description,
        status, priority, sla_duration, sla_deadline, sla_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.ticketNo,
        data.agentId,
        data.customerName,
        data.customerPhone,
        data.customerEmail,
        data.customerAddress,
        data.customerAccountNo,
        data.serialNo,
        data.deviceModel,
        data.issueDescription,
        data.status || "Pending",
        priority,
        slaDuration,
        slaDeadline,
        "Within SLA",
      ],
    );

    return this.findById(result.insertId);
  }

  static async findActiveComplaintBySerial(serialNo) {
    return getOne(
      `SELECT c.*, u.name AS agent_name, u.email AS agent_email, cs.item_no, cs.item_description
       FROM complaints c
       LEFT JOIN users u ON c.agent_id = u.id
       LEFT JOIN camera_serials cs ON c.serial_no = cs.serial_number
       WHERE c.serial_no = ? AND c.status NOT IN ('Rejected', 'Replaced')
       ORDER BY c.created_at DESC LIMIT 1`,
      [serialNo],
    );
  }

  static async updateStatus(id, status) {
    await updateOne(
      `UPDATE complaints
       SET status = ?,
           sla_stopped_at = CASE
             WHEN ? = 'Replaced' AND sla_stopped_at IS NULL THEN NOW()
             ELSE sla_stopped_at
           END
       WHERE id = ?`,
      [status, status, id],
    );

    const updated = await this.findById(id);

    if (status === "Replaced") {
      await slaService.refreshSLAStatus(updated);
      return this.findById(id);
    }

    return updated;
  }

  static async update(id, data) {
    const updateData = { ...data };

    if (Object.prototype.hasOwnProperty.call(data, "priority")) {
      const complaint = await this.findById(id);
      updateData.sla_duration = await slaService.getSLADuration(data.priority);
      updateData.sla_deadline = slaService.getSLADeadline(
        complaint.created_at,
        data.priority,
      );
    }

    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");

    const incomingStatus = data.status ?? null;
    const values = [incomingStatus, ...Object.values(updateData), id];

    await updateOne(
      `UPDATE complaints
       SET sla_stopped_at = CASE
             WHEN COALESCE(?, status) = 'Replaced'
               AND sla_stopped_at IS NULL THEN NOW()
             ELSE sla_stopped_at
           END,
           ${fields}
       WHERE id = ?`,
      values,
    );

    const updated = await this.findById(id);

    if (
      updated.status === "Replaced" ||
      Object.prototype.hasOwnProperty.call(data, "priority")
    ) {
      await slaService.refreshSLAStatus(updated);
      return this.findById(id);
    }

    return updated;
  }

  static async delete(id) {
    return updateOne("DELETE FROM complaints WHERE id = ?", [id]);
  }

  static async getSLAInfo(id) {
    const complaint = await this.findById(id);
    if (!complaint) return null;
    return slaService.getSLASummary(complaint);
  }

  static async refreshSLAStatus(id) {
    const complaint = await this.findById(id);
    if (!complaint) return null;
    return slaService.refreshSLAStatus(complaint);
  }

  static async getCount(filters = {}) {
    let sql = "SELECT COUNT(*) as total FROM complaints WHERE 1=1";
    const values = [];

    if (filters.status) {
      sql += " AND status = ?";
      values.push(filters.status);
    }
    if (filters.agentId) {
      sql += " AND agent_id = ?";
      values.push(filters.agentId);
    }
    if (filters.agentIds && Array.isArray(filters.agentIds) && filters.agentIds.length > 0) {
      const placeholders = filters.agentIds.map(() => "?").join(",");
      sql += ` AND agent_id IN (${placeholders})`;
      values.push(...filters.agentIds);
    }
    if (filters.slaStatus) {
      sql += " AND sla_status = ?";
      values.push(filters.slaStatus);
    }
    if (filters.priority) {
      sql += " AND priority = ?";
      values.push(filters.priority);
    }
    if (filters.search) {
      sql += " AND (ticket_no LIKE ? OR customer_name LIKE ? OR serial_no LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const result = await getOne(sql, values);
    return result.total;
  }

  static async getBySLAStatus(slaStatus, limit = 50, offset = 0) {
    const sql = `SELECT c.*, u.name AS agent_name, u.email AS agent_email, cs.item_no, cs.item_description
                 FROM complaints c
                 LEFT JOIN users u ON c.agent_id = u.id
                 LEFT JOIN camera_serials cs ON c.serial_no = cs.serial_number
                 WHERE c.sla_status = ?
                 ORDER BY c.sla_deadline ASC
                 LIMIT ? OFFSET ?`;

    return getAll(sql, [slaStatus, limit, offset]);
  }
}

module.exports = Complaint;
