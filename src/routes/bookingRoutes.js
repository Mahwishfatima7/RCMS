const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { auth, authorize } = require("../middleware/auth");
const {
  validate,
  bookingSchema,
  bookingUpdateSchema,
} = require("../utils/validators");

router.use(auth);

router.get("/", bookingController.getBookings);

router.post(
  "/",
  authorize("admin"),
  validate(bookingSchema),
  bookingController.createBooking,
);

router.get("/:complaintId", bookingController.getBookingByComplaintId);

router.patch(
  "/:id",
  authorize("admin"),
  validate(bookingUpdateSchema),
  bookingController.updateBooking,
);

router.delete("/:id", authorize("admin"), bookingController.deleteBooking);

module.exports = router;
