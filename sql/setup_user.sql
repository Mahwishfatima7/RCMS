-- ==========================================
-- RCMS USER AND DATABASE SETUP
-- ==========================================
-- Run this script as root user to set up the rcms_user

-- Create database
CREATE DATABASE IF NOT EXISTS rcms_db;

-- Create user (if doesn't exist)
CREATE USER IF NOT EXISTS 'rcms_user'@'localhost' IDENTIFIED BY 'ronaldo7';

-- Grant all privileges on rcms_db to rcms_user
GRANT ALL PRIVILEGES ON rcms_db.* TO 'rcms_user'@'localhost';

-- Flush privileges to update the grant tables
FLUSH PRIVILEGES;

-- Verify the user was created
SELECT User, Host FROM mysql.user WHERE User='rcms_user';

-- Show the rcms_db exists
SHOW DATABASES LIKE 'rcms_db';
