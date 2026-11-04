const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth, authorize } = require("../middleware/auth");
const { validate, registerSchema } = require("../utils/validators");

router.use(auth, authorize("admin", "management", "manager"));

router.get("/managers/list", userController.getManagersList);

router.get("/managers", userController.getManagers);

router.get("/", userController.getUsers);

router.post("/", validate(registerSchema), userController.getUserById); // Create in auth

router.get("/:id", userController.getUserById);

router.patch("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

module.exports = router;
