const { getOne, getAll } = require("../config/database");

exports.getDashboard = async (req, res, next) => {
  try {
    // Total complaints
    const totalResult = await getOne(
      "SELECT COUNT(*) as total FROM complaints",
    );
    const totalComplaints = totalResult.total;

    // Status distribution - ordered by our desired status order
    const statusResult = await getAll(`
      SELECT status, COUNT(*) as count 
      FROM complaints 
      GROUP BY status
      ORDER BY CASE status
        WHEN 'Pending' THEN 1
        WHEN 'Booked' THEN 2
        WHEN 'In-Progress' THEN 3
        WHEN 'Replaced' THEN 4
        WHEN 'Rejected' THEN 5
        ELSE 6
      END
    `);

    // Monthly trends
    const monthlyResult = await getAll(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as submitted,
        SUM(CASE WHEN status IN ('Replaced', 'Rejected') THEN 1 ELSE 0 END) as resolved
      FROM complaints 
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC 
      LIMIT 12
    `);

    // Agent stats
    const agentResult = await getAll(`
      SELECT 
        u.id,
        u.name,
        COUNT(c.id) as tickets_created,
        SUM(CASE WHEN c.status IN ('Replaced', 'Rejected') THEN 1 ELSE 0 END) as resolved
      FROM users u
      LEFT JOIN complaints c ON u.id = c.agent_id
      WHERE u.role = 'agent'
      GROUP BY u.id, u.name
    `);

    res.json({
      success: true,
      data: {
        totalComplaints,
        statusDistribution: statusResult,
        monthlyTrends: monthlyResult,
        agentStats: agentResult,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, status, search } = req.query;

    let sql = `SELECT c.*, u.name AS agent_name, u.email AS agent_email, u.manager_name 
               FROM complaints c 
               LEFT JOIN users u ON c.agent_id = u.id 
               WHERE 1=1`;
    const values = [];

    if (dateFrom) {
      sql += " AND DATE(c.created_at) >= ?";
      values.push(dateFrom);
    }
    if (dateTo) {
      sql += " AND DATE(c.created_at) <= ?";
      values.push(dateTo);
    }
    if (status) {
      sql += " AND c.status = ?";
      values.push(status);
    }
    if (search) {
      sql += " AND (c.ticket_no LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR c.customer_name LIKE ? OR c.customer_phone LIKE ? OR c.serial_no LIKE ? OR c.device_model LIKE ?)";
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY c.created_at DESC";

    const complaints = await getAll(sql, values);

    res.json({
      success: true,
      data: { complaints, total: complaints.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, status, search } = req.query;

    let sql = `SELECT c.*, u.name AS agent_name, u.email AS agent_email, u.manager_name 
               FROM complaints c 
               LEFT JOIN users u ON c.agent_id = u.id 
               WHERE 1=1`;
    const values = [];

    if (dateFrom) {
      sql += " AND DATE(c.created_at) >= ?";
      values.push(dateFrom);
    }
    if (dateTo) {
      sql += " AND DATE(c.created_at) <= ?";
      values.push(dateTo);
    }
    if (status) {
      sql += " AND c.status = ?";
      values.push(status);
    }
    if (search) {
      sql += " AND (c.ticket_no LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR c.customer_name LIKE ? OR c.customer_phone LIKE ? OR c.serial_no LIKE ? OR c.device_model LIKE ?)";
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY c.created_at DESC";

    const complaints = await getAll(sql, values);

    // CSV headers
    const headers = [
      "Ticket No",
      "Agent",
      "Manager",
      "Customer",
      "Serial",
      "Model",
      "Status",
      "Created",
    ];
    const rows = complaints.map((c) => [
      c.ticket_no,
      c.agent_name,
      c.manager_name || "—",
      c.customer_name,
      c.serial_no,
      c.device_model,
      c.status,
      c.created_at,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rcms-report-${new Date().toISOString().split("T")[0]}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
