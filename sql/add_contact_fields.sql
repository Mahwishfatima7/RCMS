-- Migration: Add contact fields to users table
-- Date: 2026-04-20

ALTER TABLE users ADD COLUMN contact_no VARCHAR(20) AFTER phone;
ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(20) AFTER contact_no;

-- Create indexes for faster lookups
CREATE INDEX idx_contact_no ON users(contact_no);
