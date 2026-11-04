-- Migration: Add customer_account_no field to complaints and manufacturer_updates tables
-- Purpose: Add customer account number field with minimum 9 digits validation
-- Created: 2026-04-29

-- Add to complaints table
ALTER TABLE complaints ADD COLUMN customer_account_no VARCHAR(50) AFTER customer_address;

-- Add to manufacturer_updates for reference
ALTER TABLE manufacturer_updates ADD COLUMN customer_account_no VARCHAR(50) AFTER notes;
