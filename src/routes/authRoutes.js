const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth, authorize } = require("../middleware/auth");
const {
  validate,
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  agentCreationSchema,
  changePasswordSchema,
} = require("../utils/validators");

// Public routes
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Admin only - Create user (admin, management)
router.post(
  "/register",
  auth,
  authorize("admin"),
  validate(registerSchema),
  authController.register,
);

// Management only - Create agent
router.post(
  "/agents",
  auth,
  authorize("management"),
  validate(agentCreationSchema),
  authController.createAgent,
);

// Protected routes
router.get("/me", auth, authController.getMe);
router.post("/logout", auth, authController.logout);

// Authenticated user - Change password
router.post(
  "/change-password",
  auth,
  validate(changePasswordSchema),
  authController.changePassword,
);

module.exports = router;
