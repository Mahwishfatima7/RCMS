/**
 * SLA (Service Level Agreement) Utility Functions
 * Handles SLA calculations, tracking, and status management
 */

const { getOne, getAll, updateOne } = require("../config/database");

// Default SLA durations in hours (if sla_config table is not available)
const DEFAULT_SLA_DURATIONS = {
  low: 72,
  medium: 48,
  high: 24,
  critical: 8,
};

const SLA_AT_RISK_THRESHOLD = 0.8; // 80% of time passed

/**
 * Get SLA duration for a priority level
 * @param {string} priority - Priority level (low, medium, high, critical)
 * @returns {number} Duration in hours
 */
exports.getSLADuration = async (priority = "medium") => {
  try {
    const config = await getOne(
      "SELECT duration_hours FROM sla_config WHERE priority = ?",
      [priority],
    );
    return config?.duration_hours || DEFAULT_SLA_DURATIONS[priority] || 48;
  } catch (error) {
        return DEFAULT_SLA_DURATIONS[priority] || 48;
  }
};

/**
 * Calculate SLA deadline based on creation time and priority
 * @param {Date} createdAt - When the complaint was created
 * @param {string} priority - Priority level
 * @returns {Date} SLA deadline
 */
exports.calculateSLADeadline = async (createdAt, priority = "medium") => {
  const duration = await exports.getSLADuration(priority);
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + duration);
  return deadline;
};

/**
 * Determine SLA status based on current time and deadline
 * @param {Date} deadline - SLA deadline
 * @param {Date} resolvedAt - When ticket was resolved (optional)
 * @param {string} priority - Priority level for duration calculation
 * @returns {Promise<string>} SLA status (Within SLA, At Risk, Breached)
 */
exports.determineSLAStatus = async (deadline, resolvedAt = null, priority = "medium") => {
  const now = new Date();

  // If ticket is resolved before deadline, it's within SLA
  if (resolvedAt) {
    const resolvedTime = new Date(resolvedAt);
    if (resolvedTime <= deadline) {
      return "Within SLA";
    } else {
      return "Breached";
    }
  }

  // For open tickets, check against current time
  if (now > deadline) {
    return "Breached";
  }

  // Get the actual duration from database based on priority
  const duration = await exports.getSLADuration(priority);
  const totalDurationMs = duration * 60 * 60 * 1000; // Convert hours to milliseconds
  const createdAt = new Date(deadline.getTime() - totalDurationMs);
  
  const timeRemaining = deadline - now;
  const elapsedTime = now - createdAt;
  const percentageUsed = (elapsedTime / totalDurationMs) * 100;

  if (percentageUsed >= SLA_AT_RISK_THRESHOLD * 100) {
    return "At Risk";
  }

  return "Within SLA";
};

/**
 * Calculate time remaining in hours
 * @param {Date} deadline - SLA deadline
 * @returns {number} Hours remaining (can be negative if breached)
 */
exports.calculateTimeRemaining = (deadline) => {
  const now = new Date();
  const diff = deadline - now;
  return Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate percentage of SLA time used
 * @param {Date} createdAt - When complaint was created
 * @param {Date} deadline - SLA deadline
 * @returns {number} Percentage (0-100)
 */
exports.calculateSLAPercentageUsed = (createdAt, deadline) => {
  const now = new Date();
  const totalDuration = deadline - new Date(createdAt);
  const elapsedTime = now - new Date(createdAt);

  if (elapsedTime <= 0) return 0;
  if (elapsedTime >= totalDuration) return 100;

  return Math.round((elapsedTime / totalDuration) * 100);
};

/**
 * Get SLA summary for a single complaint with all details
 * @param {Object} complaint - Complaint object
 * @returns {Promise<Object>} SLA summary with all metrics
 */
exports.getSLASummary = async (complaint) => {
  if (!complaint.sla_deadline) {
    return null;
  }

  const deadline = new Date(complaint.sla_deadline);
  const status = await exports.determineSLAStatus(
    deadline,
    complaint.status === "Replaced" ? complaint.updated_at : null,
    complaint.priority,
  );

  return {
    id: complaint.id,
    ticketNo: complaint.ticket_no,
    slaStatus: status,
    slaDeadline: complaint.sla_deadline,
    slaBreachedAt: complaint.sla_breached_at,
    timeRemaining: exports.calculateTimeRemaining(deadline),
    percentageUsed: exports.calculateSLAPercentageUsed(
      complaint.created_at,
      deadline,
    ),
    priority: complaint.priority,
    slaDuration: complaint.sla_duration,
  };
};

/**
 * Refresh SLA status in database for a single complaint
 * @param {Object} complaint - Complaint object
 * @returns {Promise<string>} Updated SLA status
 */
exports.refreshSLAStatus = async (complaint) => {
  if (!complaint || !complaint.sla_deadline) {
    return null;
  }

  const deadline = new Date(complaint.sla_deadline);
  const status = await exports.determineSLAStatus(
    deadline,
    complaint.status === "Replaced" ? complaint.updated_at : null,
    complaint.priority,
  );

  // Update database with new status
  const { updateOne } = require("../config/database");
  const breachedAt = status === "Breached" ? new Date() : null;
  await updateOne(
    "UPDATE complaints SET sla_status = ?, sla_breached_at = ? WHERE id = ?",
    [status, breachedAt, complaint.id],
  );

  return status;
};

/**
 * Update all SLA statuses in batch (for background job)
 * Updates tickets to Within SLA, At Risk, or Breached status
 * Includes both open and resolved tickets
 * @returns {Promise<number>} Number of tickets updated
 */
exports.updateAllSLAStatuses = async () => {
  try {
    const { getAll, updateOne } = require("../config/database");
    
    // Get all tickets (both open and resolved)
    const allTickets = await getAll(
      "SELECT * FROM complaints",
    );

    let updatedCount = 0;

    for (const ticket of allTickets) {
      // For resolved tickets, pass the updated_at time to check if resolved before deadline
      const isResolved = ticket.status === 'Replaced' || ticket.status === 'Rejected';
      const newStatus = await exports.determineSLAStatus(
        new Date(ticket.sla_deadline),
        isResolved ? ticket.updated_at : null,
        ticket.priority,
      );

      // If status changed, update it in database
      if (newStatus !== ticket.sla_status) {
        const breachedAt = newStatus === "Breached" ? new Date() : null;
        await updateOne(
          "UPDATE complaints SET sla_status = ?, sla_breached_at = ? WHERE id = ?",
          [newStatus, breachedAt, ticket.id],
        );
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (error) {
        return 0;
  }
};

/**
 * Backward compatibility - alias for updateAllSLAStatuses
 * @deprecated Use updateAllSLAStatuses instead
 */
exports.updateAllBreachedTickets = exports.updateAllSLAStatuses;

/**
 * Update complaint SLA status in database
 * @param {number} complaintId - Complaint ID
 * @param {string} newStatus - New SLA status
 * @returns {Promise<void>}
 */
exports.updateComplaintSLAStatus = async (complaintId, newStatus) => {
  const now = new Date();
  const breachedAt = newStatus === "Breached" ? now : null;

  await updateOne(
    "UPDATE complaints SET sla_status = ?, sla_breached_at = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, breachedAt, complaintId],
  );

  // Log to SLA audit trail
  try {
    const complaint = await getOne("SELECT sla_status FROM complaints WHERE id = ?", [
      complaintId,
    ]);
    if (complaint && complaint.sla_status !== newStatus) {
      await updateOne(
        "INSERT INTO sla_audit (complaint_id, old_status, new_status, reason) VALUES (?, ?, ?, ?)",
        [
          complaintId,
          complaint.sla_status || "Unknown",
          newStatus,
          "Automatic SLA status update",
        ],
      );
    }
  } catch (error) {
      }
};

/**
 * Refresh SLA status for a complaint and update if changed
 * @param {Object} complaint - Complaint object
 * @returns {Promise<string>} Updated SLA status
 */
exports.refreshSLAStatus = async (complaint) => {
  if (!complaint.sla_deadline) {
    return complaint.sla_status;
  }

  const deadline = new Date(complaint.sla_deadline);
  const newStatus = await exports.determineSLAStatus(
    deadline,
    complaint.status === "Replaced" ? complaint.updated_at : null,
    complaint.priority,
  );

  if (newStatus !== complaint.sla_status) {
    await exports.updateComplaintSLAStatus(complaint.id, newStatus);
  }

  return newStatus;
};

/**
 * Get SLA statistics for reporting
 * @param {Object} filters - Filter options (agentId, status, etc.)
 * @returns {Promise<Object>} SLA statistics
 */
exports.getSLAStatistics = async (filters = {}) => {
  let sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN sla_status = 'Within SLA' THEN 1 ELSE 0 END) as within_sla,
      SUM(CASE WHEN sla_status = 'At Risk' THEN 1 ELSE 0 END) as at_risk,
      SUM(CASE WHEN sla_status = 'Breached' THEN 1 ELSE 0 END) as breached,
      SUM(CASE WHEN priority = 'critical' AND sla_status = 'Breached' THEN 1 ELSE 0 END) as critical_breached,
      AVG(sla_duration) as avg_sla_duration,
      MIN(sla_deadline) as earliest_deadline,
      MAX(sla_deadline) as latest_deadline
    FROM complaints
    WHERE 1=1
  `;

  const values = [];

  if (filters.agentId) {
    sql += " AND agent_id = ?";
    values.push(filters.agentId);
  }

  if (filters.slaStatus) {
    sql += " AND sla_status = ?";
    values.push(filters.slaStatus);
  }

  if (filters.priority) {
    sql += " AND priority = ?";
    values.push(filters.priority);
  }

  try {
    const result = await getOne(sql, values);
    return {
      total: result.total || 0,
      withinSLA: result.within_sla || 0,
      atRisk: result.at_risk || 0,
      breached: result.breached || 0,
      criticalBreached: result.critical_breached || 0,
      avgSLADuration: result.avg_sla_duration || 48,
      earliestDeadline: result.earliest_deadline,
      latestDeadline: result.latest_deadline,
    };
  } catch (error) {
        return {
      total: 0,
      withinSLA: 0,
      atRisk: 0,
      breached: 0,
      criticalBreached: 0,
      avgSLADuration: 48,
    };
  }
};

/**
 * Get SLA distribution by priority
 * @returns {Promise<Array>} Distribution of SLA status by priority
 */
exports.getSLADistributionByPriority = async () => {
  const sql = `
    SELECT 
      priority,
      sla_status,
      COUNT(*) as count
    FROM complaints 
    GROUP BY priority, sla_status
    ORDER BY 
      CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END,
      CASE sla_status WHEN 'Breached' THEN 1 WHEN 'At Risk' THEN 2 WHEN 'Within SLA' THEN 3 END
  `;

  try {
    const rawData = await getAll(sql, []);
    
    // Ensure all priority-status combinations exist with at least 0
    const priorities = ['critical', 'high', 'medium', 'low'];
    const statuses = ['Within SLA', 'At Risk', 'Breached'];
    const distribution = [];
    
    // Create a map for quick lookup
    const dataMap = {};
    rawData.forEach(row => {
      const key = `${row.priority}-${row.sla_status}`;
      dataMap[key] = row.count;
    });
    
    // Build complete distribution with all combinations
    priorities.forEach(priority => {
      statuses.forEach(status => {
        const key = `${priority}-${status}`;
        distribution.push({
          priority,
          sla_status: status,
          count: dataMap[key] || 0
        });
      });
    });
    
    return distribution;
  } catch (error) {
        return [];
  }
};

/**
 * Batch update SLA status for all tickets (open and resolved)
 * Used for periodic refresh
 * @returns {Promise<Object>} Summary of updated tickets
 */
exports.refreshAllOpenSLAStatuses = async () => {
  const sql = `
    SELECT id, sla_deadline, sla_status, created_at, updated_at, status, priority
    FROM complaints
  `;

  try {
    const complaints = await getAll(sql, []);
    let updated = 0;
    let breached = 0;
    let atRisk = 0;

    for (const complaint of complaints) {
      // For resolved tickets (Replaced, Rejected), check if they were resolved before deadline
      const isResolved = complaint.status === 'Replaced' || complaint.status === 'Rejected';
      const newStatus = await exports.determineSLAStatus(
        new Date(complaint.sla_deadline),
        isResolved ? complaint.updated_at : null,
        complaint.priority || "medium",
      );

      if (newStatus !== complaint.sla_status) {
        await exports.updateComplaintSLAStatus(complaint.id, newStatus);
        updated++;

        if (newStatus === "Breached") breached++;
        if (newStatus === "At Risk") atRisk++;
      }
    }

    return { total: complaints.length, updated, breached, atRisk };
  } catch (error) {
        return { total: 0, updated: 0, breached: 0, atRisk: 0 };
  }
};

