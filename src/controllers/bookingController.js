const ManufacturerUpdate = require("../models/ManufacturerUpdate");
const Complaint = require("../models/Complaint");

exports.getBookings = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const bookings = await ManufacturerUpdate.getAll(
      parseInt(limit),
      parseInt(offset),
    );

    res.json({
      success: true,
      data: { bookings, total: bookings.length },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await ManufacturerUpdate.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.json({ success: true, data: { booking } });
  } catch (err) {
    next(err);
  }
};

exports.getBookingByComplaintId = async (req, res, next) => {
  try {
    const booking = await ManufacturerUpdate.findByComplaintId(
      req.params.complaintId,
    );
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "No booking found for this complaint" });
    }

    res.json({ success: true, data: { booking } });
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const {
      complaintId,
      bookingId,
      bookedDate,
      manufacturerStatus,
      referenceNo,
      notes,
    } = req.body;

    // Verify complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    // Check if booking already exists
    const existing = await ManufacturerUpdate.findByComplaintId(complaintId);
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          error: "Booking already exists for this complaint",
        });
    }

    const booking = await ManufacturerUpdate.create({
      complaintId,
      bookingId,
      bookedDate,
      manufacturerStatus,
      referenceNo,
      notes,
    });

    // Update complaint status to In-Progress
    await Complaint.updateStatus(complaintId, "In-Progress");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await ManufacturerUpdate.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const updated = await ManufacturerUpdate.update(req.params.id, req.body);

    res.json({
      success: true,
      message: "Booking updated",
      data: { booking: updated },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await ManufacturerUpdate.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    await ManufacturerUpdate.delete(req.params.id);

    // Reset complaint status to Pending
    await Complaint.updateStatus(booking.complaint_id, "Pending");

    res.json({
      success: true,
      message: "Booking deleted",
    });
  } catch (err) {
    next(err);
  }
};
