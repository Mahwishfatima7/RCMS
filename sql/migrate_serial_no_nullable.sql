-- Migration: Make serial_no nullable in complaints table
-- Date: 2026-04-12
-- Purpose: Allow complaints to be created without a valid serial number in registry

ALTER TABLE complaints MODIFY COLUMN serial_no VARCHAR(50) NULL;
