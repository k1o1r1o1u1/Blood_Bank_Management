-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - DATABASE TRIGGERS
-- File: triggers.sql
-- Database: blood_bank
-- Description: Business rules, constraints, and audit automations
-- =====================================================================

USE blood_bank;

DELIMITER $$

-- =====================================================================
-- 1. trg_validate_unit_before_issue
-- BEFORE INSERT ON issues
-- Ensures a blood unit CANNOT be issued if:
--   a) It does not exist
--   b) It is already issued or reserved
--   c) It has expired past its shelf life
--   d) Its blood group does not match the request's blood group
-- =====================================================================
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

    -- 1. Fetch unit details
    SELECT status, expiry_date, blood_group_id
    INTO v_unit_status, v_unit_expiry, v_unit_group_id
    FROM blood_units
    WHERE unit_id = NEW.unit_id;

    IF v_unit_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit does not exist in inventory.';
    END IF;

    -- 2. Fetch blood request details
    SELECT blood_group_id, status
    INTO v_req_group_id, v_req_status
    FROM blood_requests
    WHERE request_id = NEW.request_id;

    IF v_req_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood request does not exist.';
    END IF;

    -- 3. Verify request is not already rejected
    IF v_req_status = 'Rejected' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Cannot issue blood for a Rejected blood request.';
    END IF;

    -- 4. Check unit availability
    IF v_unit_status = 'Issued' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: This blood unit has already been issued.';
    END IF;

    IF v_unit_status != 'Available' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit is not Available for issuance.';
    END IF;

    -- 5. Check expiry date against issue date
    IF v_unit_expiry < NEW.issue_date THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Blood unit has expired and cannot be issued.';
    END IF;

    -- 6. Check blood group compatibility
    IF v_unit_group_id != v_req_group_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Unit blood group does not match the requested blood group.';
    END IF;
END $$

-- =====================================================================
-- 2. trg_update_unit_status_after_issue
-- AFTER INSERT ON issues
-- Automatically updates blood_units.status to 'Issued' upon issuance
-- =====================================================================
DROP TRIGGER IF EXISTS trg_update_unit_status_after_issue $$
CREATE TRIGGER trg_update_unit_status_after_issue
AFTER INSERT ON issues
FOR EACH ROW
BEGIN
    UPDATE blood_units
    SET status = 'Issued'
    WHERE unit_id = NEW.unit_id;
END $$

-- =====================================================================
-- 3. trg_update_donor_last_donation_date
-- AFTER INSERT ON donations
-- Automatically updates the donor's last_donation_date when a new
-- donation is recorded in the system.
-- =====================================================================
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

-- =====================================================================
-- 4. trg_check_unit_expiry_before_update
-- BEFORE UPDATE ON blood_units
-- Automatically flags a unit as 'Expired' if its expiry date has passed,
-- and prevents setting an expired unit to 'Issued'.
-- =====================================================================
DROP TRIGGER IF EXISTS trg_check_unit_expiry_before_update $$
CREATE TRIGGER trg_check_unit_expiry_before_update
BEFORE UPDATE ON blood_units
FOR EACH ROW
BEGIN
    -- Prevent changing an expired unit to Issued
    IF NEW.status = 'Issued' AND OLD.status != 'Issued' AND OLD.expiry_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validation Error: Cannot issue an expired blood unit.';
    END IF;

    -- Automatically convert Available units that have expired to 'Expired'
    IF NEW.status = 'Available' AND NEW.expiry_date < CURDATE() THEN
        SET NEW.status = 'Expired';
    END IF;
END $$

DELIMITER ;
