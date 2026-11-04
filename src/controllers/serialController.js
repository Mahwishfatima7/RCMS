const SerialEntry = require("../models/SerialEntry");

exports.validateSerial = async (req, res, next) => {
  try {
    const { serialNo } = req.params;
    const validation = await SerialEntry.checkExists(serialNo);

    res.json({
      success: true,
      data: {
        exists: validation.exists,
        serial: validation.entry,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSerials = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const serials = await SerialEntry.getAll(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: { serials, total: serials.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSerialByNo = async (req, res, next) => {
  try {
    const serial = await SerialEntry.findBySerialNo(req.params.serialNo);
    if (!serial) {
      return res
        .status(404)
        .json({ success: false, error: "Serial not found" });
    }

    res.json({
      success: true,
      data: { serial },
    });
  } catch (err) {
    next(err);
  }
};

exports.createSerial = async (req, res, next) => {
  try {
    const { serialNo, itemNo, itemDescription } = req.body;

    if (!serialNo || !itemNo || !itemDescription) {
      return res.status(400).json({
        success: false,
        error: "serialNo, itemNo, and itemDescription are required",
      });
    }

    const existing = await SerialEntry.findBySerialNo(serialNo);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Serial number already exists" });
    }

    const serial = await SerialEntry.create({
      serialNumber: serialNo,
      itemNo,
      itemDescription,
    });

    res.status(201).json({
      success: true,
      message: "Serial created",
      data: { serial },
    });
  } catch (err) {
    next(err);
  }
};
