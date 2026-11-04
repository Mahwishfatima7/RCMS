-- Migration: Transition to new camera_serials table structure
-- Date: 2026-04-22
-- Purpose: Drop old serial_registry and create new camera_serials table with simplified structure

-- Step 1: Drop old serial_registry table if exists
DROP TABLE IF EXISTS serial_registry;

-- Step 2: Create new camera_serials table
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

-- Step 3: Alter complaints table to remove warranty fields
ALTER TABLE complaints 
DROP COLUMN IF EXISTS purchase_date,
DROP COLUMN IF EXISTS warranty_expiry,
DROP COLUMN IF EXISTS warranty_valid;

-- Verify the changes
SHOW COLUMNS FROM camera_serials;
SHOW COLUMNS FROM complaints;
