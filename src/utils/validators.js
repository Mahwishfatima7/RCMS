const Joi = require("joi");

// Strong password schema - minimum 8 chars with uppercase, lowercase, digit, and special char
const passwordSchema = Joi.string()
  .min(8)
  .max(100)
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[0-9]/, "digit")
  .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "special")
  .required()
  .messages({
    "string.pattern.base":
      "Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character (!@#$%^&*)",
    "string.min": "Password must be at least 8 characters",
  });

// Auth Validators
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  role: Joi.string().valid("agent", "admin", "management").default("agent"),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
});

// Refresh token schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Complaint Validators
const complaintSchema = Joi.object({
  customerName: Joi.string().min(2).required(),
  customerPhone: Joi.string()
    .pattern(/^[+\d\s\-()]+$/)
    .required(),
  customerEmail: Joi.string().email().required(),
  customerAddress: Joi.string().min(5).required(),
  serialNo: Joi.string().required(),
  issueDescription: Joi.string().min(10).required(),
  deviceModel: Joi.string().optional(),
  purchaseDate: Joi.date().optional(),
  warrantyExpiry: Joi.date().optional(),
}).unknown(true);

const complaintUpdateSchema = Joi.object({
  status: Joi.string().valid(
    "Pending",
    "In-Progress",
    "Replaced",
    "Rejected",
  ),
  priority: Joi.string().valid("low", "medium", "high", "critical"),
  customerName: Joi.string().min(2),
  customerPhone: Joi.string().pattern(/^[+\d\s\-()]+$/),
  customerEmail: Joi.string().email(),
  customerAddress: Joi.string().min(5),
  serialNo: Joi.string().allow(null),
  issueDescription: Joi.string().min(10),
  deviceModel: Joi.string(),
  purchaseDate: Joi.date().allow(null),
  warrantyExpiry: Joi.date().allow(null),
}).unknown(true);

// Booking Validators
const bookingSchema = Joi.object({
  complaintId: Joi.number().required(),
  bookingId: Joi.string().required(),
  bookedDate: Joi.date().required(),
  manufacturerStatus: Joi.string().required(),
  referenceNo: Joi.string(),
  notes: Joi.string(),
});

const bookingUpdateSchema = Joi.object({
  booking_id: Joi.string(),
  manufacturer_status: Joi.string(),
  reference_no: Joi.string(),
  notes: Joi.string(),
}).min(1);

// Serial Validators
const serialSchema = Joi.object({
  serialNo: Joi.string().required(),
  model: Joi.string().required(),
  manufacturer: Joi.string().required(),
  purchaseDate: Joi.date().required(),
  warrantyExpiry: Joi.date().required(),
});

// Agent Creation Validator
const agentCreationSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.min": "Employee name must be at least 3 characters",
    "any.required": "Employee name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  contact_no: Joi.string().required().messages({
    "any.required": "Contact number is required",
  }),
  emergency_contact: Joi.string().required().messages({
    "any.required": "Emergency contact is required",
  }),
  manager_name: Joi.string().required().messages({
    "any.required": "Manager name is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "digit")
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "special")
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters with uppercase, lowercase, digit, and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
});

// Change Password Validator
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "digit")
    .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "special")
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters with uppercase, lowercase, digit, and special character",
      "string.min": "Password must be at least 8 characters",
      "any.required": "New password is required",
    }),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    req.validatedData = value;
    next();
  };
};

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  agentCreationSchema,
  changePasswordSchema,
  complaintSchema,
  complaintUpdateSchema,
  bookingSchema,
  bookingUpdateSchema,
  serialSchema,
};
