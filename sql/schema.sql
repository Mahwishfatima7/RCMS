-- ==========================================
-- RCMS DATABASE SCHEMA
-- Created: 2026-04-08
-- Purpose: Replacement Case Management System
-- ==========================================

-- Drop existing tables if needed (careful in production!)
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS manufacturer_updates;
-- DROP TABLE IF EXISTS complaints;
-- DROP TABLE IF EXISTS camera_serials;
-- DROP TABLE IF EXISTS serial_registry;
-- DROP TABLE IF EXISTS users;

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('agent', 'admin', 'management') NOT NULL DEFAULT 'agent',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  phone VARCHAR(20),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. CAMERA SERIALS TABLE (Device Master Data)
-- ==========================================
CREATE TABLE IF NOT EXISTS camera_serials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  item_no VARCHAR(50) NOT NULL,
  item_description VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_serial_number (serial_number),
  INDEX idx_item_no (item_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. COMPLAINTS TABLE (Main Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_no VARCHAR(20) UNIQUE NOT NULL,
  agent_id INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_address VARCHAR(255) NOT NULL,
  customer_account_no VARCHAR(50),
  serial_no VARCHAR(50),
  device_model VARCHAR(100) NOT NULL,
  issue_description LONGTEXT NOT NULL,
  status ENUM('Pending', 'In-Progress', 'Replaced', 'Rejected') DEFAULT 'Pending',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_ticket_no (ticket_no),
  INDEX idx_agent_id (agent_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_serial_no (serial_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. MANUFACTURER UPDATES TABLE (Booking Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS manufacturer_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  booking_id VARCHAR(50) NOT NULL,
  booked_date DATE NOT NULL,
  manufacturer_status VARCHAR(100),
  reference_no VARCHAR(50),
  notes LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. AUDIT LOG TABLE (Compliance & History)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
-- Status searches
CREATE INDEX IF NOT EXISTS idx_complaint_status_date ON complaints(status, created_at DESC);
-- Agent daily view
CREATE INDEX IF NOT EXISTS idx_agent_created ON complaints(agent_id, created_at DESC);
-- Recent complaints
CREATE INDEX IF NOT EXISTS idx_recent_complaints ON complaints(created_at DESC);

-- ==========================================
-- VIEWS (Optional - for reporting)
-- ==========================================
CREATE OR REPLACE VIEW vw_complaint_summary AS
SELECT 
  c.id,
  c.ticket_no,
  c.status,
  u.name AS agent_name,
  c.customer_name,
  c.serial_no,
  c.device_model,
  c.warranty_valid,
  m.booking_id,
  m.manufacturer_status,
  c.created_at,
  c.updated_at,
  DATEDIFF(NOW(), c.created_at) AS days_open
FROM complaints c
LEFT JOIN users u ON c.agent_id = u.id
LEFT JOIN manufacturer_updates m ON c.id = m.complaint_id;

CREATE OR REPLACE VIEW vw_warranty_status AS
SELECT 
  s.serial_no,
  s.model,
  s.manufacturer,
  s.purchase_date,
  s.warranty_expiry,
  CASE 
    WHEN s.warranty_expiry < CURDATE() THEN 'EXPIRED'
    WHEN DATEDIFF(s.warranty_expiry, CURDATE()) <= 30 THEN 'EXPIRING_SOON'
    ELSE 'ACTIVE'
  END AS warranty_status,
  DATEDIFF(s.warranty_expiry, CURDATE()) AS days_remaining
FROM serial_registry s;
