-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - SAMPLE SEED DATA
-- File: seed.sql
-- Database: blood_bank
-- Description: Realistic sample data for demonstration / presentation
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
INSERT INTO hospitals (hospital_id, name, address, contact, email, password, role) VALUES
(1, 'Apollo Hospital', 'Bannerghatta Road, Bengaluru, Karnataka', '080-26304050', 'emergency@apollohospitals.com', 'hospital123', 'Hospital'),
(2, 'Fortis Healthcare', 'Cunningham Road, Bengaluru, Karnataka', '080-66214444', 'bloodbank@fortishealthcare.com', 'hospital123', 'Hospital'),
(3, 'Manipal Hospital', 'HAL Airport Road, Bengaluru, Karnataka', '080-25024444', 'desk@manipalhospitals.com', 'hospital123', 'Hospital'),
(4, 'Columbia Asia Hospital', 'Whitefield, Bengaluru, Karnataka', '080-61656265', 'whitefield@columbiaasia.com', 'hospital123', 'Hospital'),
(5, 'Narayana Health City', 'Bommasandra Industrial Area, Bengaluru, Karnataka', '080-71222222', 'info@narayanahealth.org', 'hospital123', 'Hospital'),
(6, 'Aster CMI Hospital', 'Bellary Road, Hebbal, Bengaluru, Karnataka', '080-43444444', 'contact@astercmi.com', 'hospital123', 'Hospital');

-- =====================================================================
-- 4. DONORS (12 Tuples)
-- =====================================================================
INSERT INTO donors (donor_id, name, email, password, role, age, gender, phone, address, blood_group_id, last_donation_date) VALUES
(1, 'Rahul Sharma', 'rahul.sharma@gmail.com', 'donor123', 'Donor', 24, 'Male', '9876543210', '120 Indiranagar, Bengaluru', 7, '2026-11-20'),
(2, 'Priya Nair', 'priya.nair@gmail.com', 'donor123', 'Donor', 28, 'Female', '9876543211', '45 Koramangala 4th Block, Bengaluru', 1, '2026-11-22'),
(3, 'Vikram Mehta', 'vikram.mehta@gmail.com', 'donor123', 'Donor', 35, 'Male', '9876543212', '78 Jayanagar 9th Block, Bengaluru', 3, '2026-11-21'),
(4, 'Ananya Sen', 'ananya.sen@gmail.com', 'donor123', 'Donor', 22, 'Female', '9876543213', '89 Malleshwaram, Bengaluru', 6, '2026-11-24'),
(5, 'Rohan Verma', 'rohan.verma@gmail.com', 'donor123', 'Donor', 31, 'Male', '9876543214', '14 HSR Layout Sector 2, Bengaluru', 7, '2026-11-25'),
(6, 'Sneha Patel', 'sneha.patel@gmail.com', 'donor123', 'Donor', 26, 'Female', '9876543215', '302 Whitefield Main Rd, Bengaluru', 5, '2026-11-23'),
(7, 'Karthik Iyer', 'karthik.iyer@gmail.com', 'donor123', 'Donor', 42, 'Male', '9876543216', '19 JP Nagar 3rd Phase, Bengaluru', 8, '2026-11-26'),
(8, 'Neha Gupta', 'neha.gupta@gmail.com', 'donor123', 'Donor', 29, 'Female', '9876543217', '56 BTM Layout 2nd Stage, Bengaluru', 2, '2026-11-24'),
(9, 'Rajesh Kulkarni', 'rajesh.k@gmail.com', 'donor123', 'Donor', 48, 'Male', '9876543218', '77 Basavanagudi, Bengaluru', 3, '2026-11-27'),
(10, 'Divya Reddy', 'divya.reddy@gmail.com', 'donor123', 'Donor', 25, 'Female', '9876543219', '21 Electronic City Phase 1, Bengaluru', 4, '2026-11-26'),
(11, 'Arjun Das', 'arjun.das@gmail.com', 'donor123', 'Donor', 30, 'Male', '9876543220', '65 Richmond Town, Bengaluru', 7, '2026-11-28'),
(12, 'Meera Krishnan', 'meera.k@gmail.com', 'donor123', 'Donor', 27, 'Female', '9876543221', '104 Sadashivanagar, Bengaluru', 1, '2026-11-28');

-- =====================================================================
-- 5. DONATIONS (14 Tuples)
-- =====================================================================
INSERT INTO donations (donation_id, donor_id, blood_group_id, donation_date, quantity, screening_status) VALUES
(1, 1, 7, '2026-11-20', 1, 'Approved'),
(2, 2, 1, '2026-11-22', 1, 'Approved'),
(3, 3, 3, '2026-11-21', 1, 'Approved'),
(4, 4, 6, '2026-11-24', 1, 'Approved'),
(5, 5, 7, '2026-11-25', 1, 'Approved'),
(6, 6, 5, '2026-11-23', 1, 'Approved'),
(7, 7, 8, '2026-11-26', 1, 'Approved'),
(8, 8, 2, '2026-11-24', 1, 'Approved'),
(9, 9, 3, '2026-11-27', 1, 'Approved'),
(10, 10, 4, '2026-11-26', 1, 'Approved'),
(11, 11, 7, '2026-11-28', 1, 'Pending'),
(12, 12, 1, '2026-11-28', 1, 'Pending'),
(13, 3, 3, '2026-10-10', 1, 'Approved'),
(14, 5, 7, '2026-10-10', 1, 'Approved');

-- =====================================================================
-- 6. BLOOD_UNITS (42 Tuples)
-- Available: 32 units, Reserved: 2 units, Expired: 2 units, Issued: 6 units
-- =====================================================================
INSERT INTO blood_units (unit_id, donation_id, blood_group_id, collection_date, expiry_date, status) VALUES
-- O+ (8 Available)
(1, 1, 7, '2026-11-20', '2027-01-01', 'Available'),
(2, 5, 7, '2026-11-25', '2027-01-06', 'Available'),
(3, 1, 7, '2026-11-18', '2026-12-30', 'Available'),
(4, 5, 7, '2026-11-22', '2027-01-03', 'Available'),
(5, 1, 7, '2026-11-24', '2027-01-05', 'Available'),
(6, 5, 7, '2026-11-26', '2027-01-07', 'Available'),
(7, 1, 7, '2026-11-27', '2027-01-08', 'Available'),
(8, 5, 7, '2026-11-28', '2027-01-09', 'Available'),

-- A+ (6 Available)
(9, 2, 1, '2026-11-22', '2027-01-03', 'Available'),
(10, 2, 1, '2026-11-19', '2026-12-31', 'Available'),
(11, 2, 1, '2026-11-21', '2027-01-02', 'Available'),
(12, 2, 1, '2026-11-25', '2027-01-06', 'Available'),
(13, 2, 1, '2026-11-26', '2027-01-07', 'Available'),
(14, 2, 1, '2026-11-27', '2027-01-08', 'Available'),

-- B+ (6 Available)
(15, 3, 3, '2026-11-21', '2027-01-02', 'Available'),
(16, 9, 3, '2026-11-27', '2027-01-08', 'Available'),
(17, 3, 3, '2026-11-23', '2027-01-04', 'Available'),
(18, 9, 3, '2026-11-24', '2027-01-05', 'Available'),
(19, 3, 3, '2026-11-25', '2027-01-06', 'Available'),
(20, 9, 3, '2026-11-26', '2027-01-07', 'Available'),

-- AB+ (3 Available)
(21, 6, 5, '2026-11-23', '2027-01-04', 'Available'),
(22, 6, 5, '2026-11-25', '2027-01-06', 'Available'),
(23, 6, 5, '2026-11-27', '2027-01-08', 'Available'),

-- O- (3 Available)
(24, 7, 8, '2026-11-26', '2027-01-07', 'Available'),
(25, 7, 8, '2026-11-22', '2027-01-03', 'Available'),
(26, 7, 8, '2026-11-25', '2027-01-06', 'Available'),

-- A- (2 Available)
(27, 8, 2, '2026-11-24', '2027-01-05', 'Available'),
(28, 8, 2, '2026-11-26', '2027-01-07', 'Available'),

-- B- (2 Available)
(29, 10, 4, '2026-11-26', '2027-01-07', 'Available'),
(30, 10, 4, '2026-11-27', '2027-01-08', 'Available'),

-- AB- (2 Available)
(31, 4, 6, '2026-11-24', '2027-01-05', 'Available'),
(32, 4, 6, '2026-11-26', '2027-01-07', 'Available'),

-- Reserved (2 Units)
(33, 1, 7, '2026-11-23', '2027-01-04', 'Reserved'),
(34, 2, 1, '2026-11-24', '2027-01-05', 'Reserved'),

-- Expired (EXACTLY 2 units: 1 B+ and 1 O+ collected 45 days ago)
(35, 13, 3, '2026-10-10', '2026-11-21', 'Expired'),
(36, 14, 7, '2026-10-10', '2026-11-21', 'Expired'),

-- Issued (6 Units)
(37, 1, 7, '2026-11-12', '2026-12-24', 'Issued'),
(38, 1, 7, '2026-11-12', '2026-12-24', 'Issued'),
(39, 2, 1, '2026-11-14', '2026-12-26', 'Issued'),
(40, 3, 3, '2026-11-15', '2026-12-27', 'Issued'),
(41, 6, 5, '2026-11-16', '2026-12-28', 'Issued'),
(42, 7, 8, '2026-11-17', '2026-12-29', 'Issued');

-- =====================================================================
-- 7. BLOOD_REQUESTS (9 Tuples)
-- =====================================================================
INSERT INTO blood_requests (request_id, hospital_id, blood_group_id, quantity_required, request_date, urgency, status) VALUES
(1, 1, 7, 2, '2026-11-28', 'Critical', 'Pending'),
(2, 2, 3, 1, '2026-11-28', 'Urgent', 'Pending'),
(3, 3, 1, 2, '2026-11-27', 'Critical', 'Approved'),
(4, 5, 8, 1, '2026-11-27', 'Urgent', 'Approved'),
(5, 4, 7, 2, '2026-11-25', 'Critical', 'Completed'),
(6, 6, 1, 1, '2026-11-24', 'Normal', 'Completed'),
(7, 2, 5, 1, '2026-11-23', 'Urgent', 'Completed'),
(8, 1, 3, 1, '2026-11-22', 'Normal', 'Completed'),
(9, 3, 6, 2, '2026-11-20', 'Normal', 'Rejected');

-- =====================================================================
-- 8. ISSUES (5 Tuples)
-- =====================================================================
INSERT INTO issues (issue_id, request_id, unit_id, issue_date, issued_by) VALUES
(1, 5, 37, '2026-11-25', 2),
(2, 5, 38, '2026-11-25', 2),
(3, 6, 39, '2026-11-24', 3),
(4, 7, 41, '2026-11-23', 2),
(5, 8, 40, '2026-11-22', 1);
