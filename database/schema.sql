-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- File: schema.sql
-- Database: blood_bank
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS blood_bank
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE blood_bank;

-- ---------------------------------------------------------------------
-- Drop existing tables in reverse dependency order to avoid FK errors
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS blood_units;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS blood_groups;

-- =====================================================================
-- 1. BLOOD_GROUPS TABLE
-- Master lookup table for standard ABO and Rh blood groups.
-- =====================================================================
CREATE TABLE blood_groups (
    blood_group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(5) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. STAFF TABLE
-- Administrative and laboratory personnel managing the blood bank.
-- =====================================================================
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

-- =====================================================================
-- 3. HOSPITALS TABLE
-- Registered healthcare institutions requesting blood units.
-- =====================================================================
CREATE TABLE hospitals (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NULL,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. DONORS TABLE
-- Registered volunteer donors.
-- Constraints:
--   - Age must be between 18 and 65 (medical donation standard).
--   - Phone must be unique.
--   - Foreign key to blood_groups.
-- =====================================================================
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

-- =====================================================================
-- 5. DONATIONS TABLE
-- Record of blood donation events and laboratory screening results.
-- Relationships:
--   - donors 1 ---- N donations
--   - blood_groups 1 ---- N donations
-- Constraints:
--   - quantity > 0
--   - screening_status IN ('Pending', 'Approved', 'Rejected')
-- =====================================================================
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

-- =====================================================================
-- 6. BLOOD_UNITS TABLE
-- Individual physical blood bags stored in cold inventory.
-- Standard whole blood shelf life is 42 days.
-- Relationships:
--   - donations 1 ---- N blood_units
--   - blood_groups 1 ---- N blood_units
-- Constraints:
--   - status IN ('Available', 'Reserved', 'Issued', 'Expired')
--   - expiry_date >= collection_date
-- =====================================================================
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

-- =====================================================================
-- 7. BLOOD_REQUESTS TABLE
-- Blood supply requests submitted by hospitals.
-- Relationships:
--   - hospitals 1 ---- N blood_requests
--   - blood_groups 1 ---- N blood_requests
-- Constraints:
--   - quantity_required > 0
--   - urgency IN ('Normal', 'Urgent', 'Critical')
--   - status IN ('Pending', 'Approved', 'Rejected', 'Completed')
-- =====================================================================
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

-- =====================================================================
-- 8. ISSUES TABLE
-- Log of blood units issued to hospitals against specific requests.
-- Relationships:
--   - blood_requests 1 ---- N issues
--   - blood_units 1 ---- 1 issues (unit_id UNIQUE: each unit issued at most once)
--   - staff 1 ---- N issues
-- =====================================================================
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
