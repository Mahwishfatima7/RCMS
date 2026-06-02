const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || "development",

  // Database
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "rcms_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your_super_secret_jwt_key",
    expiresIn: process.env.JWT_EXPIRE || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  },

  // CORS
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        ...(process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
          : []),
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  // API
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:5000/api",
    prefix: "/api",
  },
};


