-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - DATABASE INDEXES
-- File: indexes.sql
-- Database: blood_bank
-- Description: Performance optimization indexes for high-frequency queries
-- =====================================================================

USE blood_bank;

-- Helper procedure to idempotently create indexes if they do not already exist
DELIMITER $$

DROP PROCEDURE IF EXISTS create_index_if_not_exists $$
CREATE PROCEDURE create_index_if_not_exists(
    IN p_table VARCHAR(64),
    IN p_index VARCHAR(64),
    IN p_columns VARCHAR(255)
)
BEGIN
    DECLARE index_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_count
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table
      AND index_name = p_index;
      
    IF index_count = 0 THEN
        SET @sql_stmt = CONCAT('CREATE INDEX ', p_index, ' ON ', p_table, ' (', p_columns, ')');
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$

DELIMITER ;

-- =====================================================================
-- 1. DONORS TABLE INDEXES
-- =====================================================================
-- Optimize donor searches by blood group
CALL create_index_if_not_exists('donors', 'idx_donors_blood_group', 'blood_group_id');

-- Optimize donor eligibility checks based on last donation date (e.g. > 90 days ago)
CALL create_index_if_not_exists('donors', 'idx_donors_last_donation', 'last_donation_date');

-- Optimize donor name searches
CALL create_index_if_not_exists('donors', 'idx_donors_name', 'name');

-- =====================================================================
-- 2. DONATIONS TABLE INDEXES
-- =====================================================================
-- Fast lookup of all donations by donor ID
CALL create_index_if_not_exists('donations', 'idx_donations_donor', 'donor_id');

-- Filter pending donations in the screening laboratory queue
CALL create_index_if_not_exists('donations', 'idx_donations_screening', 'screening_status');

-- Sort and filter donations by donation date
CALL create_index_if_not_exists('donations', 'idx_donations_date', 'donation_date');

-- Composite index for screening by blood group
CALL create_index_if_not_exists('donations', 'idx_donations_group_screening', 'blood_group_id, screening_status');

-- =====================================================================
-- 3. BLOOD_UNITS TABLE INDEXES
-- =====================================================================
-- Fast filtering by unit status (Available, Reserved, Issued, Expired)
CALL create_index_if_not_exists('blood_units', 'idx_blood_units_status', 'status');

-- Expiry check and purge operations
CALL create_index_if_not_exists('blood_units', 'idx_blood_units_expiry', 'expiry_date');

-- High-performance composite index for inventory availability checking
-- Used by GET /api/inventory and issuance validation: WHERE blood_group_id = ? AND status = 'Available' AND expiry_date >= CURDATE()
CALL create_index_if_not_exists('blood_units', 'idx_blood_units_avail_search', 'blood_group_id, status, expiry_date');

-- Traceability from unit to origin donation
CALL create_index_if_not_exists('blood_units', 'idx_blood_units_donation', 'donation_id');

-- =====================================================================
-- 4. BLOOD_REQUESTS TABLE INDEXES
-- =====================================================================
-- Look up requests submitted by a specific hospital
CALL create_index_if_not_exists('blood_requests', 'idx_requests_hospital', 'hospital_id');

-- Filter requests by status (Pending, Approved, Completed, Rejected)
CALL create_index_if_not_exists('blood_requests', 'idx_requests_status', 'status');

-- Priority ordering by urgency and date (Critical > Urgent > Normal)
CALL create_index_if_not_exists('blood_requests', 'idx_requests_urgency_date', 'urgency, request_date');

-- Request lookup by blood group
CALL create_index_if_not_exists('blood_requests', 'idx_requests_blood_group', 'blood_group_id');

-- =====================================================================
-- 5. ISSUES TABLE INDEXES
-- =====================================================================
-- Fast retrieval of all units issued for a specific blood request
CALL create_index_if_not_exists('issues', 'idx_issues_request', 'request_id');

-- Audit and reporting queries sorted by issuance date
CALL create_index_if_not_exists('issues', 'idx_issues_date', 'issue_date');

-- Audit trail by staff member
CALL create_index_if_not_exists('issues', 'idx_issues_staff', 'issued_by');

-- =====================================================================
-- 6. HOSPITALS & STAFF INDEXES
-- =====================================================================
-- Search hospitals by name
CALL create_index_if_not_exists('hospitals', 'idx_hospitals_name', 'name');

-- Filter staff by role (Admin vs Staff)
CALL create_index_if_not_exists('staff', 'idx_staff_role', 'role');

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS create_index_if_not_exists;
