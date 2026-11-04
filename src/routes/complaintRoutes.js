const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { auth, authorize } = require("../middleware/auth");
const {
  validate,
  complaintSchema,
  complaintUpdateSchema,
} = require("../utils/validators");

// All routes require authentication
router.use(auth);

// SLA endpoints (most specific first)
router.get("/sla/statistics", complaintController.getSLAStatistics);
router.post("/sla/refresh-all", complaintController.refreshAllSLAStatuses);
router.get("/sla/:slaStatus", complaintController.getComplaintsBySLAStatus);
router.get("/:id/sla", complaintController.getSLAInfo);
router.post("/:id/sla/refresh", complaintController.refreshSLAStatus);

// Get complaints (agent can see all)
router.get("/", complaintController.getComplaints);

// Get manager's complaints (management only)
router.get(
  "/manager/:managerName",
  authorize("management", "admin"),
  complaintController.getComplaintsByManager,
);

// Get agent's complaints (agent only)
router.get(
  "/agent/:agentId",
  authorize("agent"),
  complaintController.getComplaintsByAgent,
);

// Create complaint (agents only)
router.post(
  "/",
  authorize("agent"),
  validate(complaintSchema),
  complaintController.createComplaint,
);

// Get complaint details
router.get("/:id", complaintController.getComplaintById);

// Update complaint (admin only)
router.patch(
  "/:id",
  authorize("admin", "management"),
  validate(complaintUpdateSchema),
  complaintController.updateComplaint,
);

// Update complaint status (admin only)
router.patch(
  "/:id/status",
  authorize("admin"),
  complaintController.updateComplaintStatus,
);

// Delete complaint (admin only)
router.delete("/:id", authorize("admin"), complaintController.deleteComplaint);

module.exports = router;
