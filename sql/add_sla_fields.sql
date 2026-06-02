-- ==========================================
-- SLA (SERVICE LEVEL AGREEMENT) MIGRATION
-- Adds SLA tracking to complaints table
-- ==========================================

-- Add SLA-related columns to complaints table
ALTER TABLE complaints 
ADD COLUMN sla_duration INT DEFAULT 48 COMMENT 'SLA duration in hours' AFTER priority,
ADD COLUMN sla_deadline DATETIME COMMENT 'Calculated deadline for SLA' AFTER sla_duration,
ADD COLUMN sla_status ENUM('Within SLA', 'At Risk', 'Breached') DEFAULT 'Within SLA' COMMENT 'Current SLA status' AFTER sla_deadline,
ADD COLUMN sla_breached_at DATETIME COMMENT 'Timestamp when SLA was breached' AFTER sla_status,
ADD INDEX idx_sla_status (sla_status),
ADD INDEX idx_sla_deadline (sla_deadline),
ADD INDEX idx_sla_breached (sla_breached_at);

-- Create SLA configuration table for future flexibility
CREATE TABLE IF NOT EXISTS sla_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL UNIQUE,
  duration_hours INT NOT NULL COMMENT 'SLA duration in hours for this priority',
  at_risk_percentage INT DEFAULT 80 COMMENT 'Percentage of time passed to mark as At Risk',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default SLA configurations
INSERT INTO sla_config (priority, duration_hours, at_risk_percentage) VALUES
('low', 72, 80),
('medium', 48, 80),
('high', 24, 80),
('critical', 8, 80)
ON DUPLICATE KEY UPDATE duration_hours = VALUES(duration_hours);

-- Create SLA audit trail table for compliance
CREATE TABLE IF NOT EXISTS sla_audit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_triggered_at (triggered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing view to include SLA info
CREATE OR REPLACE VIEW vw_complaint_summary AS
SELECT 
  c.id,
  c.ticket_no,
  c.status,
  u.name AS agent_name,
  c.customer_name,
  c.serial_no,
  c.device_model,
  m.booking_id,
  m.manufacturer_status,
  c.priority,
  c.sla_duration,
  c.sla_deadline,
  c.sla_status,
  c.created_at,
  c.updated_at,
  DATEDIFF(NOW(), c.created_at) AS days_open,
  TIMESTAMPDIFF(HOUR, NOW(), c.sla_deadline) AS hours_remaining
FROM complaints c
LEFT JOIN users u ON c.agent_id = u.id
LEFT JOIN manufacturer_updates m ON c.id = m.complaint_id;
