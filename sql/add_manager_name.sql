-- Migration: Add manager_name field to users table
-- Date: 2026-05-04

ALTER TABLE users ADD COLUMN manager_name VARCHAR(100) AFTER emergency_contact;

-- Create index for faster lookups
CREATE INDEX idx_manager_name ON users(manager_name);
