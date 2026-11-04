const Complaint = require("../models/Complaint");
const SerialEntry = require("../models/SerialEntry");
const { getAll, getOne } = require("../config/database");

// Generate unique ticket number
const generateTicketNo = async () => {
  const result = await getAll(
    "SELECT ticket_no FROM complaints ORDER BY id DESC LIMIT 1",
  );
  if (result.length === 0) return "RCMS-000001";

  const lastTicket = result[0].ticket_no;
  const num = parseInt(lastTicket.split("-")[1]) + 1;
  return `RCMS-${String(num).padStart(6, "0")}`;
};

exports.getComplaints = async (req, res, next) => {
  try {
    const { status, agentId, search } = req.query;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const filters = {};

    // Allow agents to see all complaints, not just their own
    // Use /agent/:agentId endpoint for agent-specific complaints
    if (agentId) {
      filters.agentId = agentId;
    }

    if (status) {
      filters.status = status;
    }

    if (search) filters.search = search;
    filters.limit = limit;
    filters.offset = offset;

    const complaints = await Complaint.getAll(filters);
    const total = await Complaint.getCount(filters);

    res.json({
      success: true,
      data: {
        complaints,
        total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintsByAgent = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const agentId = Number(req.params.agentId);

    // Ensure agent can only access their own complaints
    if (req.user.role === "agent" && req.user.id != agentId) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only view your own complaints.",
      });
    }

    const filters = {
      agentId,
      limit,
      offset,
    };

    const complaints = await Complaint.getAll(filters);
    const total = await Complaint.getCount(filters);

    res.json({
      success: true,
      data: {
        complaints,
        total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintsByManager = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const managerName = req.params.managerName;

    // Get all agents under this manager
    const agents = await getAll(
      "SELECT id FROM users WHERE manager_name = ? AND role = 'agent'",
      [managerName],
    );

    if (agents.length === 0) {
      return res.json({
        success: true,
        data: {
          complaints: [],
          total: 0,
          limit,
          offset,
        },
      });
    }

    const agentIds = agents.map(a => a.id);

    const filters = {
      agentIds,
      limit,
      offset,
    };

    const complaints = await Complaint.getAll(filters);
    const total = await Complaint.getCount(filters);

    res.json({
      success: true,
      data: {
        complaints,
        total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    res.json({ success: true, data: { complaint } });
  } catch (err) {
    next(err);
  }
};

exports.createComplaint = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerAccountNo,
      serialNo,
      issueDescription,
      deviceModel,
      priority,
    } = req.body;

    // Check if serial number exists in database
    if (serialNo) {
      const serialExists = await SerialEntry.findBySerialNo(serialNo);
      if (!serialExists) {
        return res.status(400).json({
          success: false,
          error: "Camera serial number does not exist in database",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "Serial number is required",
      });
    }

    // Check if a complaint already exists for this serial number (excluding Rejected/Replaced)
    const existingComplaint = await Complaint.findActiveComplaintBySerial(serialNo);
    if (existingComplaint) {
      return res.status(400).json({
        success: false,
        error: `Complaint is already registered for this camera. Ticket: ${existingComplaint.ticket_no}`,
        data: { existingTicket: existingComplaint.ticket_no },
      });
    }

    const ticketNo = await generateTicketNo();

    const complaint = await Complaint.create({
      ticketNo,
      agentId: req.user.id,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerAccountNo,
      serialNo: serialNo,
      deviceModel: deviceModel || "Not Specified",
      issueDescription,
      priority: priority || "medium",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: { complaint },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    const updated = await Complaint.update(req.params.id, req.body);

    res.json({
      success: true,
      message: "Complaint updated",
      data: { complaint: updated },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    const updated = await Complaint.updateStatus(req.params.id, status);

    res.json({
      success: true,
      message: "Status updated",
      data: { complaint: updated },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    await Complaint.delete(req.params.id);

    res.json({
      success: true,
      message: "Complaint deleted",
    });
  } catch (err) {
    next(err);
  }
};

// ============== SLA ENDPOINTS ==============

exports.getSLAInfo = async (req, res, next) => {
  try {
    const slaInfo = await Complaint.getSLAInfo(req.params.id);
    if (!slaInfo) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    res.json({ success: true, data: { slaInfo } });
  } catch (err) {
    next(err);
  }
};

exports.getSLAStatistics = async (req, res, next) => {
  try {
    const slaService = require("../utils/slaService");
    const filters = {
      agentId: req.query.agentId ? Number(req.query.agentId) : undefined,
      slaStatus: req.query.slaStatus,
      priority: req.query.priority,
    };

    const stats = await slaService.getSLAStatistics(filters);
    const distribution = await slaService.getSLADistributionByPriority();

    res.json({
      success: true,
      data: {
        statistics: stats,
        distribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintsBySLAStatus = async (req, res, next) => {
  try {
    const { slaStatus } = req.params;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const filters = {
      slaStatus,
      limit,
      offset,
    };

    const complaints = await Complaint.getAll(filters);
    const total = await Complaint.getCount({ slaStatus });

    res.json({
      success: true,
      data: {
        complaints,
        total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshSLAStatus = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    const newStatus = await Complaint.refreshSLAStatus(req.params.id);
    const updated = await Complaint.findById(req.params.id);

    res.json({
      success: true,
      message: "SLA status refreshed",
      data: { complaint: updated, slaStatus: newStatus },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshAllSLAStatuses = async (req, res, next) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Admin access required" });
    }

    const slaService = require("../utils/slaService");
    const result = await slaService.refreshAllOpenSLAStatuses();

    res.json({
      success: true,
      message: "All SLA statuses refreshed",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
