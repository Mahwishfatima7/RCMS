const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { auth, authorize } = require("../middleware/auth");

router.use(auth, authorize("admin", "management"));

router.get("/dashboard", analyticsController.getDashboard);

router.get("/reports", analyticsController.getReport);

router.get("/export", analyticsController.exportCSV);

module.exports = router;
