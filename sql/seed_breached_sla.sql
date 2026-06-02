-- ==========================================
-- SLA BREACHED TEST DATA SEED
-- Insert sample complaints with breached SLA status
-- ==========================================

-- Insert sample breached complaints
-- These represent tickets that have exceeded their SLA deadline
INSERT INTO complaints (
  ticket_no, agent_id, customer_name, customer_phone, customer_email, 
  customer_address, serial_no, device_model, issue_description, 
  status, priority, sla_duration, sla_deadline, sla_status, sla_breached_at, created_at
) VALUES
-- Critical priority ticket - created 8 days ago, SLA should be 8 hours
(
  'RCMS-000101', 1, 'Hassan Al-Mansouri', '+971501234567', 'hassan@email.com', 
  'Dubai Marina, Tower 5, Apt 1202', 'CAM-2024-001', 'HikVision DS-2CD2143G2', 
  'Critical: Camera complete failure, no power indicator', 
  'Pending', 'critical', 8, DATE_SUB(NOW(), INTERVAL 8 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 7 DAY, INTERVAL 16 HOUR), DATE_SUB(NOW(), INTERVAL 8 DAY)
),
-- High priority ticket - created 3 days ago, SLA should be 24 hours
(
  'RCMS-000102', 1, 'Noor Al-Falahi', '+971559876543', 'noor@email.com', 
  'JBR, Rimal Tower 3, Unit 805', 'CAM-2024-002', 'Dahua IPC-HDW3841T', 
  'High priority: Multiple cameras down due to network issue', 
  'In-Progress', 'high', 24, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 2 DAY, INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)
),
-- High priority ticket - created 2 days ago
(
  'RCMS-000103', 1, 'Rashid Al-Suwaidi', '+971504445556', 'rashid@email.com', 
  'Business Bay, Executive Tower B, Office 1501', 'CAM-2023-003', 'HikVision DS-2DE4425IW', 
  'High priority: PTZ motor malfunction, security coverage compromised', 
  'Pending', 'high', 24, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 1 DAY, INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY)
),
-- Medium priority ticket - created 3 days ago, SLA should be 48 hours
(
  'RCMS-000104', 1, 'Amira Khalil', '+971507778889', 'amira@email.com', 
  'Downtown Dubai, Burj Views, Apt 2304', 'CAM-2024-004', 'Dahua IPC-HFW2831T', 
  'Medium priority: Water damage to camera housing, condensation in lens', 
  'In-Progress', 'medium', 48, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)
),
-- Critical priority ticket - created 1 week ago
(
  'RCMS-000105', 1, 'Mohammed Hassan', '+971502223334', 'mohammed@email.com', 
  'Al Barsha, Villa 12, Street 4', 'CAM-2023-005', 'HikVision DS-2CD2347G2', 
  'Critical: Complete hardware failure affecting main security entrance', 
  'Pending', 'critical', 8, DATE_SUB(NOW(), INTERVAL 7 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 6 DAY, INTERVAL 16 HOUR), DATE_SUB(NOW(), INTERVAL 7 DAY)
),
-- High priority ticket - created 2 days ago, SLA should be 24 hours
(
  'RCMS-000106', 1, 'Layla Ahmed', '+971503334445', 'layla@email.com', 
  'Marina Oaks, Tower A, Apt 3010', 'CAM-2024-006', 'Dahua IPC-HDW2431T', 
  'High priority: Camera losing video feed intermittently throughout the day', 
  'Pending', 'high', 24, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 1 DAY, INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY)
),
-- Critical priority ticket
(
  'RCMS-000107', 1, 'Khalid Al-Abdulla', '+971505556667', 'khalid@email.com', 
  'Emirates Hills, Villa 25', 'CAM-2024-007', 'HikVision DS-2CD2T43G0', 
  'Critical: All external cameras offline, security system non-functional', 
  'In-Progress', 'critical', 8, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)
),
-- High priority ticket
(
  'RCMS-000108', 1, 'Salma Rashid', '+971506667778', 'salma@email.com', 
  'Downtown Dubai, Waterfront, Apt 1805', 'CAM-2024-008', 'Dahua IPC-HFW4433T', 
  'High priority: Vandalism damage to camera dome, lens scratched', 
  'Pending', 'high', 24, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)
),
-- Medium priority ticket
(
  'RCMS-000109', 1, 'Omar Mustafa', '+971507778889', 'omar.m@email.com', 
  'JBR, Marina View Tower, Unit 1202', 'CAM-2024-001', 'HikVision DS-2CD2143G2', 
  'Medium priority: Image quality degradation, blurry footage', 
  'In-Progress', 'medium', 48, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)
),
-- Medium priority ticket  
(
  'RCMS-000110', 1, 'Hana Al-Qassim', '+971508889999', 'hana@email.com', 
  'Arabian Ranches, Villa 150', 'CAM-2024-002', 'Dahua IPC-HDW3841T', 
  'Medium priority: Night vision not working, IR illumination failing', 
  'Pending', 'medium', 48, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Breached', 
  DATE_SUB(NOW(), INTERVAL 1 DAY, INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- Also insert some "At Risk" and "Within SLA" tickets for comparison
INSERT INTO complaints (
  ticket_no, agent_id, customer_name, customer_phone, customer_email, 
  customer_address, serial_no, device_model, issue_description, 
  status, priority, sla_duration, sla_deadline, sla_status, sla_breached_at, created_at
) VALUES
-- At Risk ticket (high priority, created 20 hours ago - 20/24 hours used)
(
  'RCMS-000111', 1, 'Sarah Mohammad', '+971509990000', 'sarah@email.com', 
  'The Pier, Tower 2, Apt 2305', 'CAM-2023-003', 'HikVision DS-2DE4425IW', 
  'High priority: Camera lens fogging up, affecting visibility', 
  'Pending', 'high', 24, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'At Risk', 
  NULL, DATE_SUB(NOW(), INTERVAL 20 HOUR)
),
-- Within SLA ticket (medium priority, created 12 hours ago - well within 48 hour SLA)
(
  'RCMS-000112', 1, 'Ali Sharif', '+971501112223', 'ali.s@email.com', 
  'City Walk, Apartment 15', 'CAM-2024-004', 'Dahua IPC-HFW2831T', 
  'Medium priority: Camera mounting bracket loose, image unstable', 
  'Pending', 'medium', 48, DATE_ADD(NOW(), INTERVAL 36 HOUR), 'Within SLA', 
  NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR)
),
-- At Risk ticket (critical, created 6 hours ago - 6/8 hours used - approaching SLA)
(
  'RCMS-000113', 1, 'Fatima Hassan', '+971502223334', 'fatima.h@email.com', 
  'Springs, Tower 5, Apt 501', 'CAM-2024-006', 'Dahua IPC-HDW2431T', 
  'Critical: Main entrance camera offline, security breach risk', 
  'In-Progress', 'critical', 8, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'At Risk', 
  NULL, DATE_SUB(NOW(), INTERVAL 6 HOUR)
),
-- Within SLA ticket (low priority, created 2 days ago - well within 72 hour SLA)
(
  'RCMS-000114', 1, 'Khaled Saeed', '+971503334445', 'khaled@email.com', 
  'Arabian Ranches, Villa 200', 'CAM-2024-007', 'HikVision DS-2CD2T43G0', 
  'Low priority: Minor image distortion at night', 
  'Pending', 'low', 72, DATE_ADD(NOW(), INTERVAL 46 HOUR), 'Within SLA', 
  NULL, DATE_SUB(NOW(), INTERVAL 26 HOUR)
);

-- Verify the data was inserted
SELECT 'Breached tickets: ' as check_result, COUNT(*) as total FROM complaints WHERE sla_status = 'Breached';
SELECT 'At Risk tickets: ' as check_result, COUNT(*) as total FROM complaints WHERE sla_status = 'At Risk';
SELECT 'Within SLA tickets: ' as check_result, COUNT(*) as total FROM complaints WHERE sla_status = 'Within SLA';
