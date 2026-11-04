-- Migration: Make warranty columns nullable
-- Date: 2026-04-12
-- Purpose: Allow complaints without warranty data

ALTER TABLE complaints 
MODIFY COLUMN purchase_date DATE NULL,
MODIFY COLUMN warranty_expiry DATE NULL;

SHOW COLUMNS FROM complaints WHERE Field IN ('purchase_date', 'warranty_expiry');
