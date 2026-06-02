const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.getAll(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: { users, total: users.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { name, email, role, status, phone, department } = req.body;
    const updated = await User.update(req.params.id, {
      name,
      email,
      role,
      status,
      phone,
      department,
    });

    res.json({
      success: true,
      message: "User updated",
      data: { user: updated },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await User.delete(req.params.id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.getManagers = async (req, res, next) => {
  try {
    const { getAll } = require("../config/database");
    
    // Get ALL management users dynamically
    const managers = await getAll(
      `SELECT id, name 
       FROM users 
       WHERE role = 'management' AND status = 'active'
       ORDER BY name`,
      []
    );

    // For each manager, get their assigned agents
    const managersWithAgents = await Promise.all(
      managers.map(async (manager) => {
        const agents = await getAll(
          "SELECT id, name, email, phone FROM users WHERE manager_name = ? AND role = 'agent' AND status = 'active' ORDER BY name",
          [manager.name]
        );

        return {
          id: manager.id,
          name: manager.name,
          agentCount: agents.length,
          agents: agents,
        };
      })
    );

    res.json({
      success: true,
      data: managersWithAgents,
    });
  } catch (err) {
    next(err);
  }
};

exports.getManagersList = async (req, res, next) => {
  try {
    const { getAll } = require("../config/database");
    
    // Get ALL management users dynamically (excluding 'managemnet')
    const managers = await getAll(
      `SELECT name FROM users 
       WHERE role = 'management' AND status = 'active'
       ORDER BY name`,
      []
    );

    // Return just the manager names
    const managerNames = managers.map(m => m.name);

    res.json({
      success: true,
      data: managerNames,
    });
  } catch (err) {
    next(err);
  }
};
