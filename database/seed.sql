-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - SAMPLE SEED DATA
-- File: seed.sql
-- Database: blood_bank
-- Description: Realistic sample data with >= 5 tuples per table
-- =====================================================================

USE blood_bank;

-- Disable foreign key checks during batch truncate/seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE issues;
TRUNCATE TABLE blood_requests;
TRUNCATE TABLE blood_units;
TRUNCATE TABLE donations;
TRUNCATE TABLE donors;
TRUNCATE TABLE hospitals;
TRUNCATE TABLE staff;
TRUNCATE TABLE blood_groups;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. BLOOD_GROUPS (8 Tuples)
-- =====================================================================
INSERT INTO blood_groups (blood_group_id, group_name) VALUES
(1, 'A+'),
(2, 'A-'),
(3, 'B+'),
(4, 'B-'),
(5, 'AB+'),
(6, 'AB-'),
(7, 'O+'),
(8, 'O-');

-- =====================================================================
-- 2. STAFF (5 Tuples)
-- Passwords include plaintext for development / API demo testing
-- and compatibility with bcrypt password verification in backend.
-- =====================================================================
INSERT INTO staff (staff_id, name, role, phone, email, password) VALUES
(1, 'Dr. Sarah Jenkins', 'Admin', '9876500001', 'admin@bloodbank.org', 'adminpassword'),
(2, 'Rajesh Verma', 'Staff', '9876500002', 'staff@bloodbank.org', 'staffpassword'),
(3, 'Priya Sharma', 'Staff', '9876500003', 'priya.s@bloodbank.org', 'staffpassword'),
(4, 'Dr. Amit Patel', 'Admin', '9876500004', 'amit.patel@bloodbank.org', 'adminpassword'),
(5, 'Sunita Rao', 'Staff', '9876500005', 'sunita.rao@bloodbank.org', 'staffpassword');

-- =====================================================================
-- 3. HOSPITALS (6 Tuples)
-- =====================================================================
INSERT INTO hospitals (hospital_id, name, address, contact, email) VALUES
(1, 'Apollo Hospital', 'Bannerghatta Road, Bengaluru, Karnataka', '080-26304050', 'emergency@apollohospitals.com'),
(2, 'Fortis Healthcare', 'Cunningham Road, Bengaluru, Karnataka', '080-66214444', 'bloodbank@fortishealthcare.com'),
(3, 'Manipal Hospital', 'HAL Airport Road, Bengaluru, Karnataka', '080-25024444', 'desk@manipalhospitals.com'),
(4, 'Columbia Asia Hospital', 'Whitefield, Bengaluru, Karnataka', '080-61656265', 'whitefield@columbiaasia.com'),
(5, 'Narayana Health City', 'Bommasandra Industrial Area, Bengaluru, Karnataka', '080-71222222', 'info@narayanahealth.org'),
(6, 'Aster CMI Hospital', 'Bellary Road, Hebbal, Bengaluru, Karnataka', '080-43444444', 'contact@astercmi.com');

-- =====================================================================
-- 4. DONORS (10 Tuples)
-- =====================================================================
INSERT INTO donors (donor_id, name, age, gender, phone, address, blood_group_id, last_donation_date) VALUES
(1, 'Rahul Sharma', 24, 'Male', '9876543210', '120 Indiranagar, Bengaluru', 7, '2026-09-15'),
(2, 'Priya Nair', 28, 'Female', '9876543211', '45 Koramangala 4th Block, Bengaluru', 1, '2026-09-20'),
(3, 'Vikram Mehta', 35, 'Male', '9876543212', '78 Jayanagar 9th Block, Bengaluru', 3, '2026-09-22'),
(4, 'Ananya Sen', 22, 'Female', '9876543213', '89 Malleshwaram, Bengaluru', 6, '2026-09-25'),
(5, 'Rohan Verma', 31, 'Male', '9876543214', '14 HSR Layout Sector 2, Bengaluru', 7, '2026-09-28'),
(6, 'Sneha Patel', 26, 'Female', '9876543215', '302 Whitefield Main Rd, Bengaluru', 5, '2026-10-01'),
(7, 'Karthik Iyer', 42, 'Male', '9876543216', '19 JP Nagar 3rd Phase, Bengaluru', 8, '2026-10-02'),
(8, 'Neha Gupta', 29, 'Female', '9876543217', '56 BTM Layout 2nd Stage, Bengaluru', 2, '2026-10-03'),
(9, 'Rajesh Kulkarni', 48, 'Male', '9876543218', '77 Basavanagudi, Bengaluru', 3, '2026-10-04'),
(10, 'Divya Reddy', 25, 'Female', '9876543219', '21 Electronic City Phase 1, Bengaluru', 4, '2026-10-05');

-- =====================================================================
-- 5. DONATIONS (10 Tuples)
-- =====================================================================
INSERT INTO donations (donation_id, donor_id, blood_group_id, donation_date, quantity, screening_status) VALUES
(1, 1, 7, '2026-09-15', 1, 'Approved'),
(2, 2, 1, '2026-09-20', 1, 'Approved'),
(3, 3, 3, '2026-09-22', 1, 'Approved'),
(4, 4, 6, '2026-09-25', 1, 'Approved'),
(5, 5, 7, '2026-09-28', 1, 'Approved'),
(6, 6, 5, '2026-10-01', 1, 'Approved'),
(7, 7, 8, '2026-10-02', 1, 'Approved'),
(8, 8, 2, '2026-10-03', 1, 'Approved'),
(9, 9, 3, '2026-10-04', 1, 'Pending'),
(10, 10, 4, '2026-10-05', 1, 'Rejected');

-- =====================================================================
-- 6. BLOOD_UNITS (24 Tuples)
-- Covers: Available, Reserved, Expired, and Issued units
-- Shelf life is calculated at 42 days from collection date
-- =====================================================================
INSERT INTO blood_units (unit_id, donation_id, blood_group_id, collection_date, expiry_date, status) VALUES
-- Available units (Fresh stock, future expiry date)
(1, 1, 7, '2026-09-28', '2026-11-09', 'Available'),
(2, 1, 7, '2026-09-28', '2026-11-09', 'Available'),
(3, 2, 1, '2026-09-29', '2026-11-10', 'Available'),
(4, 2, 1, '2026-09-30', '2026-11-11', 'Available'),
(5, 3, 3, '2026-10-01', '2026-11-12', 'Available'),
(6, 3, 3, '2026-10-01', '2026-11-12', 'Available'),
(7, 4, 6, '2026-10-02', '2026-11-13', 'Available'),
(8, 5, 7, '2026-10-03', '2026-11-14', 'Available'),
(9, 6, 5, '2026-10-04', '2026-11-15', 'Available'),
(10, 7, 8, '2026-10-05', '2026-11-16', 'Available'),
(11, 7, 8, '2026-10-06', '2026-11-17', 'Available'),
(12, 8, 2, '2026-10-06', '2026-11-17', 'Available'),
(13, NULL, 4, '2026-10-07', '2026-11-18', 'Available'),
(14, NULL, 7, '2026-10-08', '2026-11-19', 'Available'),

-- Reserved units (Held for confirmed surgery/allocation)
(15, 5, 7, '2026-10-02', '2026-11-13', 'Reserved'),
(16, 6, 5, '2026-10-03', '2026-11-14', 'Reserved'),

-- Expired units (Collected 55 days ago, expired 13 days ago)
(17, NULL, 7, '2026-08-15', '2026-09-26', 'Expired'),
(18, NULL, 1, '2026-08-16', '2026-09-27', 'Expired'),

-- Issued units (Units that were dispensed to hospitals in issues table)
(19, 1, 7, '2026-09-15', '2026-10-27', 'Issued'),
(20, 1, 7, '2026-09-15', '2026-10-27', 'Issued'),
(21, 2, 1, '2026-09-20', '2026-11-01', 'Issued'),
(22, 3, 3, '2026-09-22', '2026-11-03', 'Issued'),
(23, 4, 6, '2026-09-25', '2026-11-06', 'Issued'),
(24, 7, 8, '2026-09-26', '2026-11-07', 'Issued');

-- =====================================================================
-- 7. BLOOD_REQUESTS (8 Tuples)
-- Covers: Pending, Approved, Completed, and Rejected requests
-- =====================================================================
INSERT INTO blood_requests (request_id, hospital_id, blood_group_id, quantity_required, request_date, urgency, status) VALUES
(1, 1, 8, 2, '2026-10-08', 'Critical', 'Pending'),
(2, 2, 6, 1, '2026-10-08', 'Critical', 'Pending'),
(3, 3, 4, 2, '2026-10-09', 'Urgent', 'Approved'),
(4, 1, 7, 2, '2026-09-18', 'Critical', 'Completed'),
(5, 4, 1, 1, '2026-09-22', 'Urgent', 'Completed'),
(6, 5, 3, 1, '2026-09-24', 'Normal', 'Completed'),
(7, 6, 5, 1, '2026-09-25', 'Normal', 'Pending'),
(8, 2, 7, 4, '2026-09-26', 'Normal', 'Rejected');

-- =====================================================================
-- 8. ISSUES (6 Tuples)
-- Blood units issued to hospitals against blood requests
-- =====================================================================
INSERT INTO issues (issue_id, request_id, unit_id, issue_date, issued_by) VALUES
(1, 4, 19, '2026-09-18', 1),
(2, 4, 20, '2026-09-18', 1),
(3, 5, 21, '2026-09-22', 2),
(4, 6, 22, '2026-09-24', 3),
(5, 5, 23, '2026-09-26', 1),
(6, 6, 24, '2026-09-27', 2);
