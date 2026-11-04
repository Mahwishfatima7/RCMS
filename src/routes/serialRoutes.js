const express = require("express");
const router = express.Router();
const serialController = require("../controllers/serialController");
const { auth, authorize } = require("../middleware/auth");
const { validate, serialSchema } = require("../utils/validators");

// Public route for serial validation
router.get("/validate/:serialNo", serialController.validateSerial);

// Protected routes
router.use(auth);

router.get("/", serialController.getSerials);

router.post(
  "/",
  authorize("admin"),
  validate(serialSchema),
  serialController.createSerial,
);

router.get("/:serialNo", serialController.getSerialByNo);

module.exports = router;
