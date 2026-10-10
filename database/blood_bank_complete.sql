-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - ALL-IN-ONE MASTER SCRIPT
-- File: blood_bank_complete.sql
-- Database: blood_bank
-- Description: Complete initialization script containing schema,
--              indexes, views, procedures, seed data, and triggers.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS blood_bank
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE blood_bank;

-- Disable checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. DROP EXISTING TABLES
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS blood_units;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS blood_groups;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 2. CREATE TABLES & CONSTRAINTS
-- ---------------------------------------------------------------------

-- Blood Groups
CREATE TABLE blood_groups (
    blood_group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(5) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff
CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Staff',
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_staff_role CHECK (role IN ('Admin', 'Staff'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hospitals
CREATE TABLE hospitals (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NULL,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donors
CREATE TABLE donors (
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NULL,
    blood_group_id INT NOT NULL,
    last_donation_date DATE NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_donor_age CHECK (age >= 18 AND age <= 65),
    CONSTRAINT chk_donor_gender CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT fk_donors_blood_group FOREIGN KEY (blood_group_id)
        REFERENCES blood_groups (blood_group_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations
CREATE TABLE donations (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    blood_group_id INT NOT NULL,
    donation_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    screening_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_donation_quantity CHECK (quantity > 0),
    CONSTRAINT chk_screening_status CHECK (screening_status IN ('Pending', 'Approved', 'Rejected')),
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id)
        REFERENCES donors (donor_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_donations_blood_group FOREIGN KEY (blood_group_id)
        REFERENCES blood_groups (blood_group_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blood Units
CREATE TABLE blood_units (
    unit_id INT PRIMARY KEY AUTO_INCREMENT,
    donation_id INT NULL,
    blood_group_id INT NOT NULL,
    collection_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit_status CHECK (status IN ('Available', 'Reserved', 'Issued', 'Expired')),
    CONSTRAINT chk_unit_dates CHECK (expiry_date >= collection_date),
    CONSTRAINT fk_units_donation FOREIGN KEY (donation_id)
        REFERENCES donations (donation_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_units_blood_group FOREIGN KEY (blood_group_id)
        REFERENCES blood_groups (blood_group_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blood Requests
CREATE TABLE blood_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_group_id INT NOT NULL,
    quantity_required INT NOT NULL,
    request_date DATE NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'Normal',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_request_quantity CHECK (quantity_required > 0),
    CONSTRAINT chk_request_urgency CHECK (urgency IN ('Normal', 'Urgent', 'Critical')),
    CONSTRAINT chk_request_status CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    CONSTRAINT fk_requests_hospital FOREIGN KEY (hospital_id)
        REFERENCES hospitals (hospital_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_requests_blood_group FOREIGN KEY (blood_group_id)
        REFERENCES blood_groups (blood_group_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Issues
CREATE TABLE issues (
    issue_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    unit_id INT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    issued_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_issues_request FOREIGN KEY (request_id)
        REFERENCES blood_requests (request_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_issues_unit FOREIGN KEY (unit_id)
        REFERENCES blood_units (unit_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_issues_staff FOREIGN KEY (issued_by)
        REFERENCES staff (staff_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX idx_donors_blood_group ON donors (blood_group_id);
CREATE INDEX idx_donors_last_donation ON donors (last_donation_date);
CREATE INDEX idx_donors_name ON donors (name);

CREATE INDEX idx_donations_donor ON donations (donor_id);
CREATE INDEX idx_donations_screening ON donations (screening_status);
CREATE INDEX idx_donations_date ON donations (donation_date);
CREATE INDEX idx_donations_group_screening ON donations (blood_group_id, screening_status);

CREATE INDEX idx_blood_units_status ON blood_units (status);
CREATE INDEX idx_blood_units_expiry ON blood_units (expiry_date);
CREATE INDEX idx_blood_units_avail_search ON blood_units (blood_group_id, status, expiry_date);
CREATE INDEX idx_blood_units_donation ON blood_units (donation_id);

CREATE INDEX idx_requests_hospital ON blood_requests (hospital_id);
CREATE INDEX idx_requests_status ON blood_requests (status);
CREATE INDEX idx_requests_urgency_date ON blood_requests (urgency, request_date);
CREATE INDEX idx_requests_blood_group ON blood_requests (blood_group_id);

CREATE INDEX idx_issues_request ON issues (request_id);
CREATE INDEX idx_issues_date ON issues (issue_date);
CREATE INDEX idx_issues_staff ON issues (issued_by);

CREATE INDEX idx_hospitals_name ON hospitals (name);
CREATE INDEX idx_staff_role ON staff (role);

-- ---------------------------------------------------------------------
-- 4. VIEWS
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW available_blood_inventory AS
SELECT 
    bg.blood_group_id,
    bg.group_name AS blood_group,
    COUNT(CASE 
        WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 
    END) AS available_units
FROM blood_groups bg
LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
GROUP BY bg.blood_group_id, bg.group_name
ORDER BY bg.blood_group_id ASC;

CREATE OR REPLACE VIEW pending_requests AS
SELECT 
    br.request_id,
    h.name AS hospital_name,
    h.contact AS hospital_contact,
    bg.group_name AS blood_group,
    br.quantity_required,
    br.urgency,
    br.request_date,
    br.status
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
WHERE br.status = 'Pending'
ORDER BY 
    FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'),
    br.request_date ASC;

CREATE OR REPLACE VIEW recent_donations AS
SELECT 
    d.donation_id,
    dn.name AS donor_name,
    dn.phone AS donor_phone,
    bg.group_name AS blood_group,
    d.donation_date,
    d.quantity,
    d.screening_status
FROM donations d
JOIN donors dn ON d.donor_id = dn.donor_id
JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
ORDER BY d.donation_date DESC, d.donation_id DESC;

CREATE OR REPLACE VIEW comprehensive_blood_inventory AS
SELECT 
    bg.blood_group_id,
    bg.group_name AS blood_group,
    COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units,
    COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
    COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
    COUNT(CASE WHEN bu.status = 'Expired' OR (bu.status = 'Available' AND bu.expiry_date < CURDATE()) THEN 1 END) AS expired_units,
    COUNT(bu.unit_id) AS total_units
FROM blood_groups bg
LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
GROUP BY bg.blood_group_id, bg.group_name
ORDER BY bg.blood_group_id ASC;

CREATE OR REPLACE VIEW blood_issues_summary AS
SELECT 
    i.issue_id,
    i.request_id,
    h.name AS hospital_name,
    h.contact AS hospital_contact,
    bg.group_name AS blood_group,
    i.unit_id,
    bu.collection_date,
    bu.expiry_date,
    i.issue_date,
    i.issued_by,
    COALESCE(s.name, 'System') AS issued_by_name
FROM issues i
JOIN blood_requests br ON i.request_id = br.request_id
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN blood_units bu ON i.unit_id = bu.unit_id
JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
LEFT JOIN staff s ON i.issued_by = s.staff_id
ORDER BY i.issue_date DESC, i.issue_id DESC;

-- ---------------------------------------------------------------------
-- 5. STORED PROCEDURES
-- ---------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS get_available_blood $$
CREATE PROCEDURE get_available_blood()
BEGIN
    SELECT 
        bg.blood_group_id,
        bg.group_name AS blood_group,
        COUNT(CASE 
            WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 
        END) AS available_units,
        COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
        COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
        COUNT(CASE WHEN bu.status = 'Expired' OR (bu.status = 'Available' AND bu.expiry_date < CURDATE()) THEN 1 END) AS expired_units
    FROM blood_groups bg
    LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
    GROUP BY bg.blood_group_id, bg.group_name
    ORDER BY bg.blood_group_id ASC;
END $$

DROP PROCEDURE IF EXISTS get_hospital_requests $$
CREATE PROCEDURE get_hospital_requests(IN p_hospital_id INT)
BEGIN
    IF p_hospital_id IS NOT NULL THEN
        SELECT 
            br.request_id,
            br.hospital_id,
            h.name AS hospital_name,
            h.contact AS hospital_contact,
            br.blood_group_id,
            bg.group_name AS blood_group,
            br.quantity_required,
            br.request_date,
            br.urgency,
            br.status
        FROM blood_requests br
        JOIN hospitals h ON br.hospital_id = h.hospital_id
        JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
        WHERE br.hospital_id = p_hospital_id
        ORDER BY 
            FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'),
            br.request_date DESC;
    ELSE
        SELECT 
            br.request_id,
            br.hospital_id,
            h.name AS hospital_name,
            h.contact AS hospital_contact,
            br.blood_group_id,
            bg.group_name AS blood_group,
            br.quantity_required,
            br.request_date,
            br.urgency,
            br.status
        FROM blood_requests br
        JOIN hospitals h ON br.hospital_id = h.hospital_id
        JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
        ORDER BY 
            FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'),
            br.request_date DESC;
    END IF;
END $$

DROP PROCEDURE IF EXISTS get_donor_history $$
CREATE PROCEDURE get_donor_history(IN p_donor_id INT)
BEGIN
    SELECT 
        d.donor_id,
        d.name,
        d.age,
        d.gender,
        d.phone,
        d.address,
        bg.group_name AS blood_group,
        d.last_donation_date,
        COUNT(dn.donation_id) AS total_donations,
        COALESCE(SUM(dn.quantity), 0) AS total_units_donated
    FROM donors d
    JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
    LEFT JOIN donations dn ON d.donor_id = dn.donor_id
    WHERE d.donor_id = p_donor_id
    GROUP BY d.donor_id, d.name, d.age, d.gender, d.phone, d.address, bg.group_name, d.last_donation_date;

    SELECT 
        dn.donation_id,
        dn.donation_date,
        dn.quantity,
        dn.screening_status,
        bg.group_name AS blood_group
    FROM donations dn
    JOIN blood_groups bg ON dn.blood_group_id = bg.blood_group_id
    WHERE dn.donor_id = p_donor_id
    ORDER BY dn.donation_date DESC;
END $$

DROP PROCEDURE IF EXISTS issue_blood_unit $$
CREATE PROCEDURE issue_blood_unit(
    IN p_request_id INT,
    IN p_unit_id INT,
    IN p_issued_by INT
)
BEGIN
    DECLARE v_already_issued INT DEFAULT 0;
    DECLARE v_units_needed INT;
    DECLARE v_units_issued_so_far INT;

    SELECT COUNT(*) INTO v_already_issued
    FROM issues
    WHERE unit_id = p_unit_id;

    IF v_already_issued > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Procedure Error: Unit is already recorded as issued.';
    END IF;

    START TRANSACTION;

    INSERT INTO issues (request_id, unit_id, issue_date, issued_by)
    VALUES (p_request_id, p_unit_id, CURDATE(), p_issued_by);

    SELECT quantity_required INTO v_units_needed
    FROM blood_requests
    WHERE request_id = p_request_id;

    SELECT COUNT(*) INTO v_units_issued_so_far
    FROM issues
    WHERE request_id = p_request_id;

    IF v_units_issued_so_far >= v_units_needed THEN
        UPDATE blood_requests
        SET status = 'Completed'
        WHERE request_id = p_request_id;
    END IF;

    COMMIT;

    SELECT 'Blood unit successfully issued.' AS message, p_unit_id AS unit_id, p_request_id AS request_id;
END $$

DROP PROCEDURE IF EXISTS mark_expired_units $$
CREATE PROCEDURE mark_expired_units()
BEGIN
    DECLARE v_updated_count INT DEFAULT 0;

    UPDATE blood_units
    SET status = 'Expired'
    WHERE status = 'Available'
      AND expiry_date < CURDATE();

    SET v_updated_count = ROW_COUNT();

    SELECT 
        v_updated_count AS expired_units_marked,
        CONCAT('Updated ', v_updated_count, ' units to Expired status.') AS status_message;
END $$

DELIMITER ;

-- ---------------------------------------------------------------------
-- 6. INSERT SAMPLE DATA (>= 5 tuples per table)
-- ---------------------------------------------------------------------

-- Blood Groups (8)
INSERT INTO blood_groups (blood_group_id, group_name) VALUES
(1, 'A+'),
(2, 'A-'),
(3, 'B+'),
(4, 'B-'),
(5, 'AB+'),
(6, 'AB-'),
(7, 'O+'),
(8, 'O-');

-- Staff (5)
INSERT INTO staff (staff_id, name, role, phone, email, password) VALUES
(1, 'Dr. Sarah Jenkins', 'Admin', '9876500001', 'admin@bloodbank.org', 'adminpassword'),
(2, 'Rajesh Verma', 'Staff', '9876500002', 'staff@bloodbank.org', 'staffpassword'),
(3, 'Priya Sharma', 'Staff', '9876500003', 'priya.s@bloodbank.org', 'staffpassword'),
(4, 'Dr. Amit Patel', 'Admin', '9876500004', 'amit.patel@bloodbank.org', 'adminpassword'),
(5, 'Sunita Rao', 'Staff', '9876500005', 'sunita.rao@bloodbank.org', 'staffpassword');

-- Hospitals (6)
INSERT INTO hospitals (hospital_id, name, address, contact, email) VALUES
(1, 'Apollo Hospital', 'Bannerghatta Road, Bengaluru, Karnataka', '080-26304050', 'emergency@apollohospitals.com'),
(2, 'Fortis Healthcare', 'Cunningham Road, Bengaluru, Karnataka', '080-66214444', 'bloodbank@fortishealthcare.com'),
(3, 'Manipal Hospital', 'HAL Airport Road, Bengaluru, Karnataka', '080-25024444', 'desk@manipalhospitals.com'),
(4, 'Columbia Asia Hospital', 'Whitefield, Bengaluru, Karnataka', '080-61656265', 'whitefield@columbiaasia.com'),
(5, 'Narayana Health City', 'Bommasandra Industrial Area, Bengaluru, Karnataka', '080-71222222', 'info@narayanahealth.org'),
(6, 'Aster CMI Hospital', 'Bellary Road, Hebbal, Bengaluru, Karnataka', '080-43444444', 'contact@astercmi.com');

-- Donors (10)
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

-- Donations (10)
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

-- Blood Units (24)
INSERT INTO blood_units (unit_id, donation_id, blood_group_id, collection_date, expiry_date, status) VALUES
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
(15, 5, 7, '2026-10-02', '2026-11-13', 'Reserved'),
(16, 6, 5, '2026-10-03', '2026-11-14', 'Reserved'),
(17, NULL, 7, '2026-08-15', '2026-09-26', 'Expired'),
(18, NULL, 1, '2026-08-16', '2026-09-27', 'Expired'),
(19, 1, 7, '2026-09-15', '2026-10-27', 'Issued'),
(20, 1, 7, '2026-09-15', '2026-10-27', 'Issued'),
(21, 2, 1, '2026-09-20', '2026-11-01', 'Issued'),
(22, 3, 3, '2026-09-22', '2026-11-03', 'Issued'),
(23, 4, 6, '2026-09-25', '2026-11-06', 'Issued'),
(24, 7, 8, '2026-09-26', '2026-11-07', 'Issued');

-- Blood Requests (8)
INSERT INTO blood_requests (request_id, hospital_id, blood_group_id, quantity_required, request_date, urgency, status) VALUES
(1, 1, 8, 2, '2026-10-08', 'Critical', 'Pending'),
(2, 2, 6, 1, '2026-10-08', 'Critical', 'Pending'),
(3, 3, 4, 2, '2026-10-09', 'Urgent', 'Approved'),
(4, 1, 7, 2, '2026-09-18', 'Critical', 'Completed'),
(5, 4, 1, 1, '2026-09-22', 'Urgent', 'Completed'),
(6, 5, 3, 1, '2026-09-24', 'Normal', 'Completed'),
(7, 6, 5, 1, '2026-09-25', 'Normal', 'Pending'),
(8, 2, 7, 4, '2026-09-26', 'Normal', 'Rejected');

-- Issues (6)
INSERT INTO issues (issue_id, request_id, unit_id, issue_date, issued_by) VALUES
(1, 4, 19, '2026-09-18', 1),
(2, 4, 20, '2026-09-18', 1),
(3, 5, 21, '2026-09-22', 2),
(4, 6, 22, '2026-09-24', 3),
(5, 5, 23, '2026-09-26', 1),
(6, 6, 24, '2026-09-27', 2);

-- ---------------------------------------------------------------------
-- 7. TRIGGERS
-- Loaded after seed data to ensure smooth initial population
-- ---------------------------------------------------------------------
DELIMITER $$

DROP TRIGGER IF EXISTS trg_validate_unit_before_issue $$
CREATE TRIGGER trg_validate_unit_before_issue
BEFORE INSERT ON issues
FOR EACH ROW
BEGIN
    DECLARE v_unit_status VARCHAR(20);
    DECLARE v_unit_expiry DATE;
    DECLARE v_unit_group_id INT;
    DECLARE v_req_group_id INT;
    DECLARE v_req_status VARCHAR(20);

    SELECT status, expiry_date, blood_group_id
    INTO v_unit_status, v_unit_expiry, v_unit_group_id
    FROM blood_units
    WHERE unit_id = NEW.unit_id;

    IF v_unit_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit does not exist in inventory.';
    END IF;

    SELECT blood_group_id, status
    INTO v_req_group_id, v_req_status
    FROM blood_requests
    WHERE request_id = NEW.request_id;

    IF v_req_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood request does not exist.';
    END IF;

    IF v_req_status = 'Rejected' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Cannot issue blood for a Rejected blood request.';
    END IF;

    IF v_unit_status = 'Issued' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: This blood unit has already been issued.';
    END IF;

    IF v_unit_status != 'Available' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit is not Available for issuance.';
    END IF;

    IF v_unit_expiry < NEW.issue_date THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit has expired and cannot be issued.';
    END IF;

    IF v_unit_group_id != v_req_group_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Unit blood group does not match the requested blood group.';
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_update_unit_status_after_issue $$
CREATE TRIGGER trg_update_unit_status_after_issue
AFTER INSERT ON issues
FOR EACH ROW
BEGIN
    UPDATE blood_units
    SET status = 'Issued'
    WHERE unit_id = NEW.unit_id;
END $$

DROP TRIGGER IF EXISTS trg_update_donor_last_donation_date $$
CREATE TRIGGER trg_update_donor_last_donation_date
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    UPDATE donors
    SET last_donation_date = NEW.donation_date
    WHERE donor_id = NEW.donor_id
      AND (last_donation_date IS NULL OR last_donation_date < NEW.donation_date);
END $$

DROP TRIGGER IF EXISTS trg_check_unit_expiry_before_update $$
CREATE TRIGGER trg_check_unit_expiry_before_update
BEFORE UPDATE ON blood_units
FOR EACH ROW
BEGIN
    IF NEW.status = 'Issued' AND OLD.status != 'Issued' AND OLD.expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Cannot issue an expired blood unit.';
    END IF;

    IF NEW.status = 'Available' AND NEW.expiry_date < CURDATE() THEN
        SET NEW.status = 'Expired';
    END IF;
END $$

DELIMITER ;
