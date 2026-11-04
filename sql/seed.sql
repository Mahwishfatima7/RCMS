-- ==========================================
-- RCMS DATABASE SEED DATA
-- Sample data for testing and development
-- ==========================================

-- Insert sample users
INSERT INTO users (name, email, password_hash, role, status, phone, department) VALUES
('Ahmed Khan', 'ahmed@isp.com', '$2a$10$PDO8RC0HrxGqK.qOUcLv5OtOAP9N5qVf3XnJLJ8ZohcPMCHfV9Fia', 'agent', 'active', '+971501234567', 'Support'),
('Sara Admin', 'sara@dxb.net', '$2a$10$PDO8RC0HrxGqK.qOUcLv5OtOAP9N5qVf3XnJLJ8ZohcPMCHfV9Fia', 'admin', 'active', '+971559876543', 'Administration'),
('Mohammed Dir', 'mohammed@dxb.net', '$2a$10$PDO8RC0HrxGqK.qOUcLv5OtOAP9N5qVf3XnJLJ8ZohcPMCHfV9Fia', 'management', 'active', '+971504445556', 'Management');

-- Insert camera serials (Device master data)
INSERT INTO camera_serials (serial_number, item_no, item_description) VALUES
('CAM-2024-001', 'ITM-001', 'HikVision DS-2CD2143G2'),
('CAM-2024-002', 'ITM-002', 'Dahua IPC-HDW3841T'),
('CAM-2023-003', 'ITM-003', 'HikVision DS-2DE4425IW'),
('CAM-2024-004', 'ITM-004', 'Dahua IPC-HFW2831T'),
('CAM-2023-005', 'ITM-005', 'HikVision DS-2CD2347G2'),
('CAM-2024-006', 'ITM-006', 'Dahua IPC-HDW2431T'),
('CAM-2024-007', 'ITM-007', 'HikVision DS-2CD2T43G0'),
('CAM-2024-008', 'ITM-008', 'Dahua IPC-HFW4433T');

-- Insert sample complaints
INSERT INTO complaints (ticket_no, agent_id, customer_name, customer_phone, customer_email, customer_address, serial_no, device_model, issue_description, status, priority) VALUES
('RCMS-000001', 1, 'Ali Hassan', '+971501234567', 'ali@email.com', 'Dubai Marina, Tower 5, Apt 1202', 'CAM-2024-001', 'HikVision DS-2CD2143G2', 'Camera showing black screen intermittently, IR LEDs not working at night', 'Pending', 'high'),
('RCMS-000002', 1, 'Fatima Al-Rashid', '+971559876543', 'fatima@email.com', 'JBR, Rimal Tower 3, Unit 805', 'CAM-2024-002', 'Dahua IPC-HDW3841T', 'Water damage to camera housing, condensation inside lens', 'Booked', 'medium'),
('RCMS-000003', 1, 'Omar Khalil', '+971504445556', 'omar@email.com', 'Business Bay, Executive Tower B, Office 1501', 'CAM-2023-003', 'HikVision DS-2DE4425IW', 'PTZ motor malfunction, camera stuck in one position', 'Rejected', 'low'),
('RCMS-000004', 1, 'Layla Mahmoud', '+971507778889', 'layla@email.com', 'Downtown Dubai, Burj Views, Apt 2304', 'CAM-2024-004', 'Dahua IPC-HFW2831T', 'Network connectivity issues, camera goes offline frequently', 'In-Progress', 'medium'),
('RCMS-000005', 1, 'Youssef Nasser', '+971502223334', 'youssef@email.com', 'Al Barsha, Villa 12, Street 4', 'CAM-2023-005', 'HikVision DS-2CD2347G2', 'Complete hardware failure, no power indicator', 'Rejected', 'critical');

-- Insert sample manufacturer updates
INSERT INTO manufacturer_updates (complaint_id, booking_id, booked_date, manufacturer_status, reference_no, notes) VALUES
(2, 'HK-2024-05621', '2026-03-27', 'Received', 'REF-2024-0001', 'Camera received at manufacturer service center. Awaiting inspection.'),
(4, 'DH-2024-08794', '2026-03-29', 'In-Repair', 'REF-2024-0002', 'Device under inspection. Hardware failure confirmed. Replacement unit being prepared.');

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, timestamp) VALUES
(1, 'CREATE', 'complaint', 1, '{"status":"Pending","ticket_no":"RCMS-000001"}', NOW()),
(1, 'CREATE', 'complaint', 2, '{"status":"Pending","ticket_no":"RCMS-000002"}', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'UPDATE', 'complaint', 2, '{"status":"Booked"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'CREATE', 'manufacturer_update', 1, '{"booking_id":"HK-2024-05621"}', DATE_SUB(NOW(), INTERVAL 1 DAY));
