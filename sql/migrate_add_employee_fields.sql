-- Migration: Add employee fields to users table
-- Date: 2026-04-20

ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) UNIQUE AFTER id;
ALTER TABLE users ADD COLUMN contact_no VARCHAR(20) AFTER phone;
ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(20) AFTER contact_no;

-- Create index for employee_id
CREATE INDEX idx_employee_id ON users(employee_id);
