const User = require("../models/User");
const { comparePassword, hashPassword } = require("../utils/password");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { sendAgentCredentialsEmail } = require("../utils/emailService");

// Helper function to generate random password
const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: { token, refreshToken, user: userWithoutPassword },
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "agent",
      phone,
      department,
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { token, refreshToken, user: userWithoutPassword },
    });
  } catch (err) {
    next(err);
  }
};

// Create agent - Called by management users only
exports.createAgent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      contact_no,
      emergency_contact,
      manager_name,
      password,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    // Check if agent already exists by email
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: "Agent with this email already exists",
      });
    }

    // Hash the provided password
    const passwordHash = await hashPassword(password);

    // Create agent with 'agent' role
    const agent = await User.create({
      name,
      email,
      passwordHash,
      role: "agent",
      contact_no: contact_no || null,
      emergency_contact: emergency_contact || null,
      manager_name: manager_name || null,
    });

    // Send credentials email to agent
    const emailResult = await sendAgentCredentialsEmail(email, name, password);

    const { password_hash, ...agentWithoutPassword } = agent;

    res.status(201).json({
      success: true,
      message: emailResult.success 
        ? "Agent created successfully and credentials email sent" 
        : "Agent created but email delivery failed. Check backend logs.",
      emailSent: emailResult.success,
      data: {
        agent: agentWithoutPassword,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, error: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// Change password - Authenticated users only
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    // Fetch user with password hash
    const user = await User.findByEmail(
      req.user.email || (await User.findById(userId)).email,
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: "New password must be different from current password",
      });
    }

    // Hash and update new password
    const newPasswordHash = await hashPassword(newPassword);
    await User.update(userId, { password_hash: newPasswordHash });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
