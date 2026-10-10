-- =====================================================================
-- BLOOD BANK MANAGEMENT SYSTEM - STORED PROCEDURES
-- File: procedures.sql
-- Database: blood_bank
-- Description: Core business logic and reporting procedures
-- =====================================================================

USE blood_bank;

DELIMITER $$

-- =====================================================================
-- 1. get_available_blood
-- Recommended Procedure:
-- Returns available, non-expired inventory count for all blood groups.
-- Usage: CALL get_available_blood();
-- =====================================================================
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

-- =====================================================================
-- 2. get_hospital_requests
-- Recommended Procedure:
-- Returns requests submitted by a specific hospital, or all requests
-- if p_hospital_id is NULL.
-- Usage: 
--   CALL get_hospital_requests(1);     -- Specific hospital
--   CALL get_hospital_requests(NULL);  -- All hospitals
-- =====================================================================
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

-- =====================================================================
-- 3. get_donor_history
-- Recommended Procedure:
-- Returns donor profile summary and donation history for a given donor ID.
-- Usage: CALL get_donor_history(1);
-- =====================================================================
DROP PROCEDURE IF EXISTS get_donor_history $$
CREATE PROCEDURE get_donor_history(IN p_donor_id INT)
BEGIN
    -- 1. Profile Summary
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

    -- 2. Detailed Donation Records
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

-- =====================================================================
-- 4. issue_blood_unit
-- Stored Procedure for atomic issuance of a single blood unit
-- Usage: CALL issue_blood_unit(1, 10, 1);
-- =====================================================================
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

    -- Check if unit is already issued
    SELECT COUNT(*) INTO v_already_issued
    FROM issues
    WHERE unit_id = p_unit_id;

    IF v_already_issued > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Procedure Error: Unit is already recorded as issued.';
    END IF;

    START TRANSACTION;

    -- Insert into issues table (triggers will validate unit status, expiry, blood group match)
    INSERT INTO issues (request_id, unit_id, issue_date, issued_by)
    VALUES (p_request_id, p_unit_id, CURDATE(), p_issued_by);

    -- Check if total required units for this request have been satisfied
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

-- =====================================================================
-- 5. mark_expired_units
-- Maintenance procedure to automatically flag past-due blood units as Expired
-- Usage: CALL mark_expired_units();
-- =====================================================================
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
